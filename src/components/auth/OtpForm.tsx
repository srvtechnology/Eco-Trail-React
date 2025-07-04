import { Link } from "react-router";
import { useFormik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import axios from 'axios';

interface OtpFormProps {
    email?: string;
}

interface OtpFormValues {
    email: string;
    otp: string;
}

export default function OtpForm({ email }: OtpFormProps) {

    const formik = useFormik<OtpFormValues>({
        initialValues: {
            email: email || "",
            otp: "",
        },
        validationSchema: Yup.object({
            otp: Yup.string().min(6, "Must be at least 6 characters").required("Required"),
        }),
        onSubmit: async (
            values: OtpFormValues,
            { setSubmitting }: FormikHelpers<OtpFormValues>
        ) => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/verify-otp`,
                    values,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        withCredentials: true
                    }
                );

                if (response && response.status !== 422) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('userData', JSON.stringify(response.data.user));
                    window.location.href = '/';
                } else if (response && response.status === 422) {
                    alert(response.data.message);
                } else {
                    alert("Something went wrong");
                }
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    alert(error.response?.data?.message || "Login failed");
                } else {
                    alert("An error occurred");
                }
                console.error('Login error:', error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="flex flex-col flex-1">
            {/* <div className="w-full max-w-md pt-10 mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Back to dashboard
                </Link>
            </div> */}

            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                        Submit Otp
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter otp to verify!
                    </p>
                    <br />

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Otp Field */}
                        <div>
                            <Label>
                                Otp <span className="text-error-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    name="otp"
                                    placeholder="Enter your otp"
                                    value={formik.values.otp}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.otp && formik.errors.otp && (
                                    <p className="text-sm text-red-500">{formik.errors.otp}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <Button
                                type="submit"
                                className="w-full"
                                size="sm"
                                disabled={formik.isSubmitting}
                            >
                                {formik.isSubmitting ? "Signing in..." : "Submit"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
