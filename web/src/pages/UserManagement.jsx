import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Spinner, Navbar, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // วิ่งไปดึงข้อมูลผู้ใช้จาก Backend
        const response = await axios.get('http://localhost:5000/api/users');

        console.log("ข้อมูล Users ที่ดึงมาได้:", response.data);

        // ตรวจสอบว่าข้อมูลที่ส่งมาเป็น Array หรือซ้อนอยู่ใน Object (เช่น response.data.users)
        // ถ้า Backend ส่งกลับมาเป็น Array ตรงๆ ก็สามารถ setUsers(response.data) ได้เลย
        const usersData = Array.isArray(response.data) ? response.data : (response.data.users || []);

        setUsers(usersData);
        setIsLoading(false);
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", err);
        setError("ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้ หรือยังไม่มี API สำหรับดึงข้อมูล");
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
      console.log("กำลังจะลบ User ID:", userId); // ดูว่ามี ID ส่งเข้ามาไหม

      if (!userId) {
        alert("ไม่พบ ID ของผู้ใช้งานนี้");
        return;
      }
      //แจ้งเตือนก่อนลบ
      if (window.confirm("คุณแน่ใจหรือไม่ในการลบผู้ใช้รายนี้")) {
        try {
          const response = await axios.delete(`http://localhost:5000/api/users/${userId}`);
          console.log("Backend ตอบกลับมาว่า :",response.data);

          // อัปเดทหน้าตารงใหม่โดยไม่ต้องรีเว็บ
          setUsers(users.filter((u) => u._id !== userId));
          alert("ลบผู้ใช้งานสำเร็จ");
        }
        catch (err) {
          console.error("Error Deleting User:", err);
          alert("เกิดข้อผิดพลาดในการลบผู้ใช้")
        }
      }
    };

  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>

      {/* ---------------- Navbar ---------------- */}
      <Navbar expand="lg" bg="dark" data-bs-theme="dark">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">SportBuddy Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
              <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/users" className="active">User Management</Nav.Link>
              <Nav.Link href="#fields">Facility Management</Nav.Link>
            </Nav>
            <Form className="d-flex">
              <Form.Control type="search" placeholder="Search..." className="me-2 shadow-none" />
              <Button variant="outline-success">Search</Button>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ---------------- ตารางแสดงข้อมูล ---------------- */}
      <Container className="mt-4 pt-3 bg-white p-4 rounded shadow-sm">
        <h2 className="mb-4 text-dark fw-bold">User Management</h2>

        {isLoading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">กำลังโหลดข้อมูลผู้ใช้งาน...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>ชื่อผู้ใช้งาน</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  // ใช้ _id เพราะ MongoDB จะสร้างฟิลด์นี้ให้อัตโนมัติ
                  <tr key={user._id || index}>
                    <td>{user._id}</td>

                    {/* เปลี่ยน username ให้ตรงกับฟิลด์ที่กำหนดไว้ใน Schema ของคุณ */}
                    <td>{user.username || user.name || '-'}</td>
                    <td>{user.email || '-'}</td>

                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdituser(user.id)}
                      >
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    ยังไม่มีข้อมูลผู้ใช้งานในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Container>
    </div>
  );
}

export default UserManagement;