import { useFormik, yupToFormErrors } from "formik";
import React, { ReactNode, useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import * as yup from "yup";
import { BiSave } from "react-icons/bi";
import axios from "axios";
import { useRouter } from "next/router";

type UserType = {
  id?: number;
  fullName: string;
  age: number | string;
  address?: string;
  email?: string;
};

type PropType = {
  user?: UserType;
};

const validationSchema = yup.object().shape({
  fullName: yup.string().required("Veuillez entrer votre Nom et Prénom"),
  age: yup
    .number()
    .min(18, "Vous devez être majeur !")
    .required("Veuillez entrer votre âge"),
  address: yup.string().nullable(),
  email: yup
    .string()
    .email("Veuillez entrer une valide address e-mail")
    .nullable(),
});

function UserForm({ user }: PropType) {
  const initialValues = useState(
    user || {
      fullName: "",
      age: "",
      address: "",
      email: "",
    }
  )[0];
  const [report, setReport] = useState("");
  const router = useRouter();

  const handleFormikSubmit = (data: UserType) => {
    if (user) {
      axios
        .put("/api/user/edit/" + user.id, data)
        .then(({ data }) => {
          setReport("success");
        })
        .catch(console.log);
    } else {
      axios
        .post("/api/user/new", data)
        .then(() => {
          setReport("success");
        })
        .catch(console.log);
    }

    // router.push("/user/");
  };

  const { values, touched, errors, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormikSubmit,
  });

  return (
    <Container>
      <h1 className="display-1 text-center" data-testid="form-title">
        {user ? "MODIFIER" : "AJOUTER"} UN UTILISATEUR
      </h1>
      <Alert show={Boolean(report)} data-testid="report">
        {report}
      </Alert>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="fullName">
          <Form.Label>NOM ET PRENOM</Form.Label>
          <Form.Control
            type="text"
            placeholder="NOM ET PRENOM"
            value={values.fullName}
            onChange={handleChange}
            data-testid="fullName"
          />
          {touched.fullName && errors.fullName && (
            <Form.Text className="text-danger">
              {errors.fullName as ReactNode}
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3" controlId="age">
          <Form.Label>AGE</Form.Label>
          <Form.Control
            type="number"
            placeholder="AGE"
            value={values.age}
            onChange={handleChange}
            data-testid="age"
          />
          {touched.age && errors.age && (
            <Form.Text className="text-danger">
              {errors.age as ReactNode}
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group className="mb-3" controlId="address">
          <Form.Label>ADRESSE</Form.Label>
          <Form.Control
            type="text"
            placeholder="ADRESSE"
            value={values.address}
            onChange={handleChange}
            data-testid="address"
          />
          {/* {touched.address && errors.address && (
            <Form.Text className="text-danger">{errors.address}</Form.Text>
          )} */}
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>EMAIL</Form.Label>
          <Form.Control
            type="text"
            placeholder="EMAIL"
            value={values.email}
            onChange={handleChange}
            data-testid="email"
          />
          {touched.email && errors.email && (
            <Form.Text className="text-danger">
              {errors.email as ReactNode}
            </Form.Text>
          )}
        </Form.Group>
        <Button variant="primary" type="submit" size="lg" data-testid="submit">
          <BiSave /> ENREGISTRER
        </Button>
      </Form>
    </Container>
  );
}

export default UserForm;
