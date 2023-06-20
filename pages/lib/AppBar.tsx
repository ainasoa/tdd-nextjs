import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

function AppBar() {
  const { data: session } = useSession();
  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <Navbar.Brand as={Link} href="/">
          Shop
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} href="/user">
              User
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        {session && (
          <div className="text-center me-5" data-testid="user-info">
            {session?.user_id}
          </div>
        )}
        {!session ? (
          <Button
            className="bg-primary"
            onClick={(e) => {
              e.preventDefault();
              signIn();
            }}
          >
            Se connecter
          </Button>
        ) : (
          <Button
            className="bg-danger"
            onClick={(e) => {
              e.preventDefault();
              signOut();
            }}
          >
            Se déconnecter
          </Button>
        )}
      </Container>
    </Navbar>
  );
}

export default AppBar;
