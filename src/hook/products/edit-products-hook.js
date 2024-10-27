import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getOneCategory } from "../../redux/actions/subcategoryAction";
import {
  getOneProduct,
  updateProducts,
} from "../../redux/actions/productsAction";
import { getAllCategory } from "../../redux/actions/categoryAction";
import { getAllBrand } from "../../redux/actions/brandAction";
import notify from "./../../hook/useNotifaction";

const AdminEditProductsHook = (id) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    prodName: "",
    prodDescription: "",
    priceBefore: "السعر قبل الخصم",
    priceAftr: "السعر بعد الخصم",
    qty: "الكمية المتاحة",
    CatID: "0",
    BrandID: "0",
    images: [],
    colors: [],
    seletedSubID: [],
  });

  // Get initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await dispatch(getOneProduct(id));
        await dispatch(getAllCategory());
        await dispatch(getAllBrand());
      } catch (error) {
        notify("خطأ في تحميل البيانات", "error");
      }
    };
    loadInitialData();
  }, [dispatch, id]);

  // Selectors
  const item = useSelector((state) => state.allproducts.oneProduct);
  const category = useSelector((state) => state.allCategory.category);
  const brand = useSelector((state) => state.allBrand.brand);
  const subCat = useSelector((state) => state.subCategory.subcategory);

  // Update form when product data is loaded
  useEffect(() => {
    if (item.data) {
      setFormData({
        ...formData,
        prodName: item.data.title,
        prodDescription: item.data.description,
        priceBefore: item.data.price,
        qty: item.data.quantity,
        CatID: item.data.category,
        BrandID: item.data.brand,
        colors: item.data.availableColors || [],
        images: item.data.images || [],
      });
    }
  }, [item.data]);

  // Handle form submission
  const handelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (
        formData.CatID === "0" ||
        !formData.prodName ||
        !formData.prodDescription ||
        formData.images.length <= 0 ||
        formData.priceBefore <= 0
      ) {
        notify("من فضلك اكمل البيانات", "warn");
        setLoading(false);
        return;
      }

      // Process images
      const processedImages = await Promise.all(
        formData.images.map(async (image) => {
          if (typeof image === "string" && image.startsWith("http")) {
            return await convertURLtoFile(image);
          } else {
            return dataURLtoFile(image, Math.random() + ".png");
          }
        })
      );

      // Create form data
      const submitFormData = new FormData();
      submitFormData.append("title", formData.prodName);
      submitFormData.append("description", formData.prodDescription);
      submitFormData.append("quantity", formData.qty);
      submitFormData.append("price", formData.priceBefore);
      submitFormData.append("category", formData.CatID);
      submitFormData.append("brand", formData.BrandID);

      // Append images
      submitFormData.append("imageCover", processedImages[0]);
      processedImages.forEach((img) => submitFormData.append("images", img));

      // Append colors and subcategories
      formData.colors.forEach((color) =>
        submitFormData.append("availableColors", color)
      );
      formData.seletedSubID.forEach((subCat) =>
        submitFormData.append("subcategory", subCat._id)
      );

      // Dispatch update action
      const response = await dispatch(updateProducts(id, submitFormData));

      if (response && response.status === 200) {
        notify("تم التعديل بنجاح", "success");
        setLoading(false);
      } else {
        notify("فشل في تحديث المنتج", "error");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      notify("حدث خطأ أثناء التحديث", "error");
      setLoading(false);
    }
  };

  // Utility functions
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const convertURLtoFile = async (url) => {
    const response = await fetch(url, { mode: "cors" });
    const data = await response.blob();
    const ext = url.split(".").pop();
    const metadata = { type: `image/${ext}` };
    return new File([data], Math.random() + ".png", metadata);
  };

  // Form update handlers
  const handleFormChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  // Return values and handlers
  return [
    formData.CatID,
    formData.BrandID,
    handleFormChange("prodDescription"),
    handleFormChange("qty"),
    // ... other handlers
    handelSubmit,
    formData.colors,
    formData.priceBefore,
    formData.qty,
    formData.prodDescription,
    formData.prodName,
  ];
};

export default AdminEditProductsHook;
