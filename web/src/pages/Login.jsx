import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../api/auth';
import { saveSession } from '../utils/auth';

// ➕ เพิ่ม: หน้า login สำหรับเว็บแอดมิน — ใช้ endpoint login เดียวกับแอปมือถือ
// แต่บล็อกบัญชีที่ role ไม่ใช่ 'admin' ไม่ให้เข้า (role ตั้งเองผ่าน MongoDB เท่านั้น ไม่มี endpoint self-promote)
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginRequest({ email, password });
      if (data.user.role !== 'admin') {
        setError('บัญชีนี้ไม่มีสิทธิ์เข้าเว็บแอดมิน');
        return;
      }
      saveSession(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="bg-light d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh' }}
    >
      <Card style={{ width: 380 }} className="shadow-sm border-0 p-2">
        <Card.Body>
          <Card.Title className="fw-bold mb-3 text-center">SportBuddy Admin</Card.Title>
          {!!error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              {/* ✏️ แก้ไข: เดิม type="email" บังคับรูปแบบอีเมลจริง (ต้องมี @) ทั้งที่ backend ไม่ได้บังคับ
                  ทำให้ล็อกอินด้วย id ที่ไม่ใช่รูปแบบอีเมล (เช่น "admin") ไม่ได้เลย เปลี่ยนเป็น "text" ให้ตรงกับ backend */}
              <Form.Control
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
