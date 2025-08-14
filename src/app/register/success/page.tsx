"use client";

import Image from "next/image";
import { Button } from "@/shared";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "lucide-react";

export default function RegisterSuccess() {
  const router = useRouter();

  return (
    <section className="flex">
      <Image
        src="/svg/loginSvg.svg"
        alt="img"
        width={540}
        height={960}
        className="w-[50%] h-screen object-cover"
        priority
      />

      <article className="flex justify-center items-center w-[50%] h-screen">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center">
            <CheckCircleIcon className="h-16 w-16 text-success" />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Account Created Successfully!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your registration has been completed.
            </p>
          </div>

          {/* Warning Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 text-left">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Note
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You won&apos;t be able to login until a company is assigned
                    to your account. If you try to login now, you&apos;ll see a
                    &quot;pending assignment&quot; message.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-gray-600">
              If you have questions about your account status, please contact:
            </p>
            <p className="text-sm font-medium text-gray-800 mt-1">
              hola@firstplug.co
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/login")}
              variant="primary"
              className="w-full rounded-md"
            >
              Go to Login
            </Button>

            <Button
              onClick={() => router.push("/register")}
              variant="outline"
              className="w-full rounded-md"
            >
              Register Another Account
            </Button>
          </div>

          {/* Footer */}
          {/* <div className="text-xs text-gray-500">
            <p>
              This is the new registration flow. Users are created without
              tenant assignment and must wait for Super Admin approval.
            </p>
          </div> */}
        </div>
      </article>
    </section>
  );
}
