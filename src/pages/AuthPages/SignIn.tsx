import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Property Management"
        description="Property Management"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
