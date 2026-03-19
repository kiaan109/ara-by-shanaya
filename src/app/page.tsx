import { HomeContent } from "@/components/HomeContent";
import { getProducts } from "@/lib/product-service";

export default async function HomePage() {
  const products = await getProducts();
  return <HomeContent products={products} />;
}
