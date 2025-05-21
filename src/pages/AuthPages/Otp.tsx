import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import OtpForm from "../../components/auth/OtpForm";
import { useParams } from "react-router";

export default function Otp() {
    const { email } = useParams();
  return (
    <>
      <PageMeta
        title="Otp Verification"
        description="Otp Verification"
      />
      <AuthLayout>
        <OtpForm email={email} />
      </AuthLayout>
    </>
  );
}
