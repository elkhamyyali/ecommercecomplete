import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import AdminSideBar from "../../Components/Admin/AdminSideBar";
import AdminAllProducts from "../../Components/Admin/AdminAllProducts";
import Pagination from "../../Components/Uitily/Pagination";
import ViewProductAdminHook from "./../../hook/admin/view-product-admin-hook";

const AdminAllProductsPage = () => {
  const [items, pageCount, onPress, loading] = ViewProductAdminHook();

  return (
    <Container>
      <Row className="py-3">
        <Col sm="3" xs="2" md="2">
          <AdminSideBar />
        </Col>{" "}
        <Col sm="9" xs="10" md="10">
          {" "}
          {loading ? (
            <div> Loading... </div>
          ) : (
            <>
              <AdminAllProducts products={items} />{" "}
              {pageCount > 1 && (
                <Pagination pageCount={pageCount} onPress={onPress} />
              )}{" "}
            </>
          )}{" "}
        </Col>{" "}
      </Row>{" "}
    </Container>
  );
};

export default AdminAllProductsPage;
