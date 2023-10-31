"use client";
import { useEffect, useState } from "react";
import TableEquipment from "@/components/TableEquipment";
import Layout from "@/common/Layout";
import Header from "@/common/Header";
import Aside from "@/components/Aside";
import ProductDetail from "@/common/ProductDetail";
import Button from "@/common/Button";
import { DownloadIcon } from "@/common/Icons";
import useModal from "@/hooks/useModal";
import { OrderServices } from "@/services/orders.services";

interface Order {
  products: string[];
}

export default function Equipment() {
  const [selectedTab, setSelectedTab] = useState<string>("Equipment");
  const { isModalOpen, closeModal, openModal } = useModal();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order[]>([]);

  const getAllOrders = async () => {
    const ordersResponse = await OrderServices.getAllOrders();
    setOrders(ordersResponse);
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  const handleTabClick = (tabName: string) => {
    setSelectedTab(tabName);
  };

  const handleClick = async (id: string) => {
    const orderResponse = await OrderServices.getOneOrder(id);
    const order: Order = {
      products: orderResponse.products.map((product) => product),
    };
    setSelectedOrder([order]);

    openModal();
  };

  return (
    <Layout className="flex flex-col gap-8">
      <Header selectedTab={selectedTab} />
      <TableEquipment handleClick={handleClick} orders={orders} />

      {isModalOpen ? (
        <Aside closeModal={closeModal} title="ID Number" className="relative">
           <section className="flex flex-col gap-4">
            {selectedOrder.products.map((product: string) => {
            return <ProductDetail key={product} product={product} className="" />;
             })}
            </section>

          <div className="flex gap-4 w-full absolute bottom-0">
            <Button
              body="Download Invoice"
              variant={"secondary"}
              size={"big"}
              icon={<DownloadIcon />}
              className={"rounded-md w-3/6 "}
            />
            <Button
              body="Download Payment Details"
              variant={"secondary"}
              size={"big"}
              icon={<DownloadIcon />}
              className={"rounded-md w-4/6 "}
            />
          </div>
        </Aside>
      ) : null}
    </Layout>
  );
}