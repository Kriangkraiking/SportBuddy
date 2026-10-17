import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Navbar, Nav, Form, Button, Modal, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
// ✏️ แก้ไข: ย้ายไป api/users.js แทนการเรียก client ตรงๆ ในไฟล์นี้
import { listUsersRequest, deleteUserRequest, updateUserRequest } from '../api/users';
import { clearSession, getSession } from '../utils/auth';

function UserManagement() {
  const navigate = useNavigate();
  const myId = getSession()?.user?.id;
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ➕ เพิ่ม: state สำหรับ modal แก้ไข user (ชื่อ/อีเมล/role)
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // วิ่งไปดึงข้อมูลผู้ใช้จาก Backend
      const data = await listUsersRequest();

      // ตรวจสอบว่าข้อมูลที่ส่งมาเป็น Array หรือซ้อนอยู่ใน Object (เช่น data.users)
      const usersData = Array.isArray(data) ? data : (data.users || []);

      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", err);
      setError("ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้ หรือยังไม่มี API สำหรับดึงข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!userId) {
      alert("ไม่พบ ID ของผู้ใช้งานนี้");
      return;
    }
    //แจ้งเตือนก่อนลบ
    if (window.confirm("คุณแน่ใจหรือไม่ในการลบผู้ใช้รายนี้")) {
      try {
        await deleteUserRequest(userId);
        // อัปเดทหน้าตารงใหม่โดยไม่ต้องรีเว็บ
        setUsers(users.filter((u) => u._id !== userId));
        alert("ลบผู้ใช้งานสำเร็จ");
      } catch (err) {
        console.error("Error Deleting User:", err);
        alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการลบผู้ใช้");
      }
    }
  };

  // ➕ เพิ่ม: เปิด modal แก้ไข user คนที่เลือก
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name || '', email: user.email || '', role: user.role || 'user' });
  };

  // ➕ เพิ่ม: บันทึกการแก้ไข (ชื่อ/อีเมล/role) ผ่าน PUT /api/users/admin/:id
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateUserRequest(editingUser._id, editForm);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      setEditingUser(null);
    } catch (err) {
      alert(err.response?.data?.message || 'แก้ไขข้อมูลผู้ใช้ไม่สำเร็จ');
    } finally {
      setSaving(false);
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
              <Nav.Link as={Link} to="/facilities">Facility Management</Nav.Link>
            </Nav>
            <Form className="d-flex">
              <Form.Control type="search" placeholder="Search..." className="me-2 shadow-none" />
              <Button variant="outline-success">Search</Button>
            </Form>
            <Button
              variant="outline-danger"
              size="sm"
              className="ms-2"
              onClick={() => {
                clearSession();
                navigate('/login');
              }}
            >
              Logout
            </Button>
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
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  // ใช้ _id เพราะ MongoDB จะสร้างฟิลด์นี้ให้อัตโนมัติ
                  <tr key={user._id || index}>
                    <td>{user._id}</td>
                    <td>{user.username || user.name || '-'}</td>
                    <td>{user.email || '-'}</td>
                    <td>
                      <Badge bg={user.role === 'admin' ? 'danger' : 'secondary'}>
                        {user.role || 'user'}
                      </Badge>
                    </td>
                    <td>
                      {/* ➕ เพิ่ม: ปุ่ม Edit ที่ใช้งานได้จริงแล้ว เปิด modal แก้ชื่อ/อีเมล/role */}
                      <button className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openEditModal(user)}
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
                  <td colSpan="5" className="text-center py-4 text-muted">
                    ยังไม่มีข้อมูลผู้ใช้งานในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Container>

      {/* ➕ เพิ่ม: modal แก้ไข user — ชื่อ/อีเมล/role */}
      <Modal show={!!editingUser} onHide={() => setEditingUser(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>แก้ไขผู้ใช้: {editingUser?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อ</Form.Label>
              <Form.Control
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={editForm.role}
                disabled={editingUser?._id === myId}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </Form.Select>
              {editingUser?._id === myId && (
                <Form.Text className="text-danger">
                  แก้ role ของบัญชีตัวเองไม่ได้ (กันล็อกตัวเองออกจากเว็บแอดมินโดยไม่ตั้งใจ)
                </Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditingUser(null)}>ยกเลิก</Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;
