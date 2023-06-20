import axios from "axios";
import { useFormik } from "formik";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Alert, Button, Container, Form, Row } from "react-bootstrap";
import * as yup from "yup";

type AuthData = {
  email: string;
  password: string;
};

type Report = {
  type?: "success" | "danger";
  message?: string;
};

const validationSchema: Object = yup.object().shape({
  email: yup
    .string()
    .email("Veuillez entrer une valide adresse e-mail !")
    .required("Veuillez entrer votre email !"),
  password: yup.string().required("Veuillez entrer votre mot de passe !"),
});

const initialValues: AuthData = {
  email: "",
  password: "",
};

function Login() {
  const router = useRouter();
  const [report, setReport] = useState<Report>({});

  const handleFormikSubmit = async (loginData: AuthData) => {
    const response = await signIn("credentials", {
      redirect: false,
      ...loginData,
    });

    if (response?.status == 200) {
      setReport({ type: "success", message: "You are logged in !" });
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } else if (response?.status === 401) {
      setReport({ type: "danger", message: "Not authenticated !" });
    } else if (response?.status === 500) {
      setReport({ type: "danger", message: "Server error !" });
    }
  };

  const { values, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormikSubmit,
  });

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row>
        <h1 className="display-1 text-center">LOGIN</h1>
        <Alert
          variant={report!.type}
          show={Boolean(report!.type)}
          data-testid="report"
        >
          {report!.message}
        </Alert>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4" controlId="email">
            <Form.Label>Email :</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              data-testid="email"
              value={values.email}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="password">
            <Form.Label>Mot de passe :</Form.Label>
            <Form.Control
              type="password"
              placeholder="Mot de passe"
              data-testid="password"
              value={values.password}
              onChange={handleChange}
            />
          </Form.Group>
          <div className="text-center">
            <Button
              variant="primary"
              type="submit"
              size="lg"
              disabled={!(values.email && values.password)}
            >
              SE CONNECTER
            </Button>
          </div>
        </Form>
      </Row>
    </Container>
  );
}

export default Login;
