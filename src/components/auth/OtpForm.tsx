import { useState } from "react";
import { Link } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import axios from 'axios';


export default function OtpForm({ email }) {
    const navigate = useNavigate();

    // Formik setup
    const formik = useFormik({
        initialValues: {
            email: email || "",
            otp: "",
        },
        validationSchema: Yup.object({
            //  email: Yup.string().email("Invalid email address").required("Required"),
            otp: Yup.string().min(6, "Must be at least 6 characters").required("Required"),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                console.log(values);
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

                console.log(response.data);


                if (response && response.status !== 422) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('userData', JSON.stringify(response.data.user));
                    window.location.href = '/dashboard';
                } else if (response && response.status === 422) {
                    alert(response.data.message);
                } else {
                    alert("Something went wrong");
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    // Handle Axios-specific error
                    alert(error.response?.data?.message || "Login failed");
                } else {
                    // Handle generic error
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
            <div className="w-full max-w-md pt-10 mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Back to dashboard
                </Link>
            </div>

            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                       Submit Otp
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter otp to verify!
                    </p>
                    <br />

                    {/* Uncomment and use these buttons if needed */}
                    {/*
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
          <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
            // Google SVG here
            Sign in with Google
          </button>
          <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
            // X SVG here
            Sign in with X
          </button>
        </div>
        <div className="relative py-3 sm:py-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
              Or
            </span>
          </div>
        </div>
        */}

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
