import axios from "axios";
import React, { useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Container,
  Row,
  Table,
} from "react-bootstrap";
import useSWR from "swr";
import { BiEdit, BiTrash, BiUserPlus } from "react-icons/bi";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Role } from "../lib/isGranted";

const getUsers = async (uri: string) => {
  const { data: users } = await axios.get(uri);

  return users;
};

function UserListPage() {
  const { data: session }: any = useSession();

  const { data, isLoading, error, mutate } = useSWR("/api/users", getUsers);
  const [report, setReport] = useState("");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Erreur...</div>;

  const handleDeleteUser = (user: any) => async () => {
    try {
      await axios.delete("/api/user/delete/" + user.id, {
        headers: {
          Authorization: session?.accessToken,
        },
      });
      await setReport("user deleted");
      await mutate();
    } catch (err: any) {
      switch (err?.response?.status) {
        case 401:
          setReport("token undefined");
          break;
        case 403:
          setReport("user unauthorized");
          break;
        default:
          break;
      }
    }
  };

  const renderUserItem = (user: any) => (
    <tr
      key={user.id}
      className="align-middle"
      data-testid={"deleted-user-" + user.id}
    >
      <td>{user.id}</td>
      <td>{user.fullName}</td>
      <td>{user.age}</td>
      <td>{user.address}</td>
      <td>{user.email}</td>
      <td className="text-center">
        <ButtonGroup>
          <Link
            href={"/user/edit/" + user.id}
            data-testid={"goto-edituser-" + user.id}
          >
            <Button>
              <BiEdit />
            </Button>
          </Link>
          {session?.user.role === Role.ADMIN && (
            <Button
              variant="danger"
              onClick={handleDeleteUser(user)}
              data-testid={"delete-user-" + user.id}
            >
              <BiTrash />
            </Button>
          )}
        </ButtonGroup>
      </td>
    </tr>
  );

  return (
    <Container data-testid="user-list-container">
      <Row>
        <h1 className="display-1 text-center">LISTE DES UTILISATEURS</h1>
        <div className="text-end my-4">
          <Link href={"/user/add"} data-testid="go-to-userform">
            <Button>
              <BiUserPlus size={24} /> NOUVEL UTILISATEUR
            </Button>
          </Link>
        </div>
      </Row>
      <Row>
        <Alert show={Boolean(report)} data-testid="report">
          {report}
        </Alert>
      </Row>
      <Row>
        <Table striped bordered responsive hover>
          <thead>
            <tr className="text-center">
              <th>ID</th>
              <th>NOM ET PRENOM</th>
              <th>AGE</th>
              <th>ADRESSE</th>
              <th>EMAIL</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>{data.map(renderUserItem)}</tbody>
        </Table>
      </Row>
    </Container>
  );
}

export default UserListPage;
