import { subDays } from "date-fns";
import { prisma } from "./prisma";

/**
 * 在庫切れまでの週数を算出
 * @param productId 商品ID
 * @param currentQuantity 現在在庫数
 * @returns 在庫切れまでの週数（無限大の場合はInfinity）
 */
export async function calculateWeeksUntilOut(
  productId: string,
  currentQuantity: number
): Promise<number> {
  // 商品情報を取得（予測値も含む）
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("商品が見つかりません");
  }

  // 直近1週間の販売履歴を取得
  const oneWeekAgo = subDays(new Date(), 7);
  let recentSales: Array<{ soldQuantity: number }> = [];
  try {
    recentSales = await prisma.salesHistory.findMany({
      where: {
        productId,
        soldDate: {
          gte: oneWeekAgo,
        },
      },
      select: {
        soldQuantity: true,
      },
    });
  } catch (error) {
    console.error(
      `Error fetching sales history for product ${productId}:`,
      error
    );
    // エラーが発生した場合は空配列として扱う
    recentSales = [];
  }

  // 直近1週間の総販売数を計算
  const weeklySales = recentSales.reduce(
    (sum, sale) => sum + sale.soldQuantity,
    0
  );

  // 販売実績がない場合は予測値を使用
  if (weeklySales === 0) {
    const predictedSales = product.predictedWeeklySales || 1; // デフォルト1
    if (predictedSales === 0) {
      return Infinity; // 販売がない場合は無限大
    }
    return currentQuantity / predictedSales;
  }

  // 週次平均販売数で割る
  return currentQuantity / weeklySales;
}

/**
 * アラート判定
 * @param weeksUntilOut 在庫切れまでの週数
 * @param threshold アラート基準週数（デフォルト: 2週）
 * @returns アラートが必要かどうか
 */
export function checkAlert(
  weeksUntilOut: number,
  threshold: number = 2
): boolean {
  return weeksUntilOut < threshold && weeksUntilOut !== Infinity;
}
