import { ShopClient } from "@/components/ShopClient";
import { getProducts } from "@/lib/product-service";

export const revalidate = 0;

export default async function ShopPage() {
  const products = await getProducts();
  return <ShopClient products={products} />;
}
