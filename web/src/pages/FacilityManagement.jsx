import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Navbar, Nav, Form, Button, Modal, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  listFacilitiesRequest,
  createFacilityRequest,
  updateFacilityRequest,
  deleteFacilityRequest,
} from '../api/facilities';
import { clearSession } from '../utils/auth';
import { SPORTS } from '../constants/options';

const EMPTY_FORM = { name: '', sport: SPORTS[0].label, address: '', capacity: 0, status: 'available' };

// ➕ เพิ่ม: หน้าจัดการสนาม (Facility Management) — ฝั่งแอดมินเท่านั้น ยังไม่เชื่อมกับแอปมือถือ
function FacilityManagement() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchFacilities = async () => {
    setIsLoading(true);
    try {
      const data = await listFacilitiesRequest();
      setFacilities(data.facilities || []);
      setError(null);
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสนาม:', err);
      setError('ไม่สามารถดึงข้อมูลสนามจากเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (facility) => {
    setEditingId(facility._id);
    setForm({
      name: facility.name,
      sport: facility.sport,
      address: facility.address || '',
      capacity: facility.capacity || 0,
      status: facility.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateFacilityRequest(editingId, form);
      } else {
        await createFacilityRequest(form);
      }
      setShowModal(false);
      await fetchFacilities();
    } catch (err) {
      alert(err.response?.data?.message || 'บันทึกข้อมูลสนามไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (facility) => {
    if (!window.confirm(`ลบ "${facility.name}" ออกจากระบบ?`)) return;
    try {
      await deleteFacilityRequest(facility._id);
      setFacilities((prev) => prev.filter((f) => f._id !== facility._id));
    } catch (err) {
      alert(err.response?.data?.message || 'ลบสนามไม่สำเร็จ');
    }
  };

  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
      <Navbar expand="lg" bg="dark" data-bs-theme="dark">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">SportBuddy Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
              <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/users">User Management</Nav.Link>
              {/* ✏️ แก้ไข: เดิม href="#fields" เป็นลิงก์เปล่า ตอนนี้ชี้มาหน้านี้จริงแล้ว */}
              <Nav.Link as={Link} to="/facilities" className="active">Facility Management</Nav.Link>
            </Nav>
            <Button
              variant="outline-danger"
              size="sm"
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

      <Container className="mt-4 pt-3 bg-white p-4 rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-dark fw-bold m-0">Facility Management</h2>
          <Button variant="primary" onClick={openCreateModal}>+ เพิ่มสนาม</Button>
        </div>

        {isLoading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">กำลังโหลดข้อมูลสนาม...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>ชื่อสนาม</th>
                <th>กีฬา</th>
                <th>ที่อยู่</th>
                <th>ความจุ</th>
                <th>สถานะ</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facilities.length > 0 ? (
                facilities.map((f) => (
                  <tr key={f._id}>
                    <td>{f.name}</td>
                    <td>{f.sport}</td>
                    <td>{f.address || '-'}</td>
                    <td>{f.capacity || '-'}</td>
                    <td>
                      <Badge bg={f.status === 'available' ? 'success' : 'secondary'}>
                        {f.status === 'available' ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}
                      </Badge>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(f)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(f)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    ยังไม่มีสนามในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'แก้ไขสนาม' : 'เพิ่มสนามใหม่'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อสนาม</Form.Label>
              <Form.Control
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ชนิดกีฬา</Form.Label>
              <Form.Select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}>
                {SPORTS.map((s) => (
                  <option key={s.key} value={s.label}>{s.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ที่อยู่</Form.Label>
              <Form.Control
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ความจุ (คน)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value, 10) || 0 })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>สถานะ</Form.Label>
              <Form.Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="available">พร้อมใช้งาน</option>
                <option value="unavailable">ไม่พร้อมใช้งาน</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>ยกเลิก</Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default FacilityManagement;
