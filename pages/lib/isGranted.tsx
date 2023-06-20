import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export const isGranted = (role: Role, Component: any) => (props: any) => {
  const { data } = useSession({ required: true });
  const router = useRouter();

  if (!data) return null;

  if (data?.user?.role !== role) return router.back();

  return <Component {...props} />;
};
