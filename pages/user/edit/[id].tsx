import { GetServerSideProps } from "next";
import axios from "axios";
import UserForm from "@/pages/components/UserForm";

export default ({ user }: any) => <UserForm user={user} />;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  let { data: user } = await axios.get(
    "https://dummyjson.com/users/" + ctx.params?.id
  );

  user = {
    id: user.id,
    fullName: user.firstName + " " + user.lastName,
    age: user.age,
    address: user.address.address,
    email: user.email,
  };

  return {
    props: {
      user,
    },
  };
};
