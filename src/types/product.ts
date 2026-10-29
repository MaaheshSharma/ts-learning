export type ApiProduct = {
  id: number;
  title: string;
  price: number;
  category: string;
  thumbnail: string;
};

export type ProductsResponse = {
  products: ApiProduct[];
  total: number;
  skip: number;
  limit: number;
};
