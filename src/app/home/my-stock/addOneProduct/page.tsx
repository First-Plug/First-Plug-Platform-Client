"use client";
import React, { useEffect, useState } from "react";
import ProductForm from "@/components/AddProduct/ProductForm";
import { setAuthInterceptor } from "@/config/axios.config";
import { BarLoader } from "@/components/Loader/BarLoader";

const AddProductPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("accessToken")) {
      setAuthInterceptor(sessionStorage.getItem("accessToken"));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <BarLoader />;
  }
  return <ProductForm isUpdate={false} />;
};

export default AddProductPage;
