import { Memberservices, ProductServices } from "@/services";
import { Product, TeamMember } from "@/types";

export const deleteMemberAction = async (
  id: string
): Promise<{ member: TeamMember; products: Product[] }> => {
  const member = await Memberservices.getOneMember(id);

  if (!member) {
    throw new Error(`Member with ID ${id} not found`);
  }

  await Memberservices.deleteMember(id);

  const nonRecoverableProducts = member.products.filter(
    (product) => !product.recoverable
  );

  if (nonRecoverableProducts.length > 0) {
    const productIds = nonRecoverableProducts.map((product) => product._id);

    await ProductServices.softDeleteMany(productIds);
  }

  return { member, products: nonRecoverableProducts };
};
