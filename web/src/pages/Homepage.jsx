import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Navbar,
    Container,
    Nav,
    NavDropdown,
    Form,
    Button,
    Row,
    Col,
    Card,
    Spinner
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './styles/Homepage.css';

function HomePage() {
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        activeMatches: 0,
        availableFields: 0,
        totalFields: 0,
        pendingReports: 0
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/dashboard');

                console.log("ข้อมูลที่ดึงมาได้:", response.data);

                // รับข้อมูลมาอัปเดตลง State
                setDashboardData({
                    totalUsers: response.data.totalUsers || 0,
                    activeMatches: response.data.activeMatches || 0,
                    availableFields: response.data.availableFields || 0,
                    totalFields: response.data.totalFields || 0,
                    pendingReports: response.data.pendingReports || 0
                });

                setIsLoading(false);
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="bg-light" style={{ minHeight: '100vh' }}>

            <Navbar expand="lg" bg="dark" data-bs-theme="dark">
                <Container fluid>
                    <Navbar.Brand href="#home">SportBuddy Admin</Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
                            {/* โค้ดส่วน Navbar ใน HomePage.jsx */}
                            <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>

                                {/* หน้า Dashboard ชี้ไปที่ / */}
                                <Nav.Link as={Link} to="/" className="active">Dashboard</Nav.Link>

                                {/* หน้า User Management ชี้ไปที่ /users */}
                                <Nav.Link as={Link} to="/users">User Management</Nav.Link>

                                <Nav.Link href="#fields">Facility Management</Nav.Link>
                            </Nav>
                            <NavDropdown title="More" id="navbarScrollingDropdown">
                                <NavDropdown.Item href="#settings">System Settings</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#logout" className="text-danger">Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        <Form className="d-flex">
                            <Form.Control type="search" placeholder="Search..." className="me-2 shadow-none" />
                            <Button variant="outline-success">Search</Button>
                        </Form>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="mt-4 pt-3">
                <h2 className="mb-4 text-dark fw-bold">System Dashboard</h2>

                {isLoading ? (
                    <div className="text-center mt-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Loading data from server...</p>
                    </div>
                ) : (
                    <Row>
                        {/* การ์ดที่ 1 */}
                        <Col lg={3} sm={6} className="mb-4">
                            <Card className="dashboard-card shadow-sm border-0 h-100">
                                <Card.Body>
                                    <div className="text-muted mb-2">Total Users</div>
                                    <h3 className="text-primary fw-bold">
                                        {/* เพิ่ม || 0 ป้องกัน Error หน้าจอขาว */}
                                        {(dashboardData.totalUsers || 0).toLocaleString()}
                                    </h3>
                                    <small className="text-muted">Registered in the system</small>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* การ์ดที่ 2 */}
                        <Col lg={3} sm={6} className="mb-4">
                            <Card className="dashboard-card shadow-sm border-0 h-100">
                                <Card.Body>
                                    <div className="text-muted mb-2">Active Matches</div>
                                    <h3 className="text-warning fw-bold">
                                        {(dashboardData.activeMatches || 0).toLocaleString()}
                                    </h3>
                                    <small className="text-muted">Currently looking for players</small>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* การ์ดที่ 3 */}
                        <Col lg={3} sm={6} className="mb-4">
                            <Card className="dashboard-card shadow-sm border-0 h-100">
                                <Card.Body>
                                    <div className="text-muted mb-2">Available Facilities</div>
                                    <h3 className="text-success fw-bold">
                                        {dashboardData.availableFields || 0} / {dashboardData.totalFields || 0}
                                    </h3>
                                    <small className="text-muted">Operational facilities</small>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* การ์ดที่ 4 */}
                        <Col lg={3} sm={6} className="mb-4">
                            <Card className="dashboard-card shadow-sm border-0 h-100">
                                <Card.Body>
                                    <div className="text-muted mb-2">Pending Reports</div>
                                    <h3 className="text-danger fw-bold">
                                        {(dashboardData.pendingReports || 0).toLocaleString()}
                                    </h3>
                                    <small className="text-muted">Awaiting admin review</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );
}

export default HomePage;