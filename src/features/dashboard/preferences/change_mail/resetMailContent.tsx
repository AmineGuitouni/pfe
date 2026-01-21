import jwt from "jsonwebtoken";
import { CheckCircle, XCircle } from "lucide-react";
import { Alert, Card, CardBody } from "@heroui/react";
import Link from "next/link";
import ResetMailForm from "./resetMailForm";

function getErrorMessage(errorType: string | null): string {
  switch (errorType) {
    case 'INVALID_TOKEN':
      return 'The verification link appears to be invalid. Please request a new verification email.';
    case 'TOKEN_EXPIRED':
      return 'This verification link has expired. Please request a new verification email.';
    case 'EMAIL_MISMATCH':
      return 'There was a mismatch with your email address. Please ensure you\'re using the correct verification link.';
    default:
      return 'We encountered an unexpected error while changing your password. Please try again.';
  }
}

export default async function ResetMailContent({ token }: { token: string | null }) {
    let verificationStatus: "success" | "error" = "success";
    let errorType: string | null = null;
  
    try {
      if (!token) {
        throw new Error("INVALID_TOKEN");
      }
  
      const verif = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (!verif) {
        throw new Error("INVALID_TOKEN");
      }
  
  
    } catch (e: any) {
      console.error(e);
      verificationStatus = "error";
      errorType = e.message;
    }
  
    const states = {
      success: {
        icon: <CheckCircle className="w-16 h-16 text-success" />,
        title: "Email Verified Successfully !",
        message: "Your email has been successfully verified. You can now change your email.",
        action: (
          <ResetMailForm token={token}/>
        )
      },
      error: {
        icon: <XCircle className="w-16 h-16 text-danger" />,
        title: "Verification Failed",
        message: getErrorMessage(errorType),
        action: (
          <></>
        )
      }
    };
  
    const currentState = states[verificationStatus];
  
    return (
      <>
      <Card className="bg-white/10 border-white/20 border-1 mt-20">
        <CardBody className="flex flex-col   items-center text-center p-8 space-y-6">
          {currentState.icon}
          
          <h1 className="text-2xl text-white font-bold">
            {currentState.title}
          </h1>
          
          <p className="text-white/50">
            {currentState.message}
          </p>
          
          {currentState.action}
  
          {verificationStatus === 'error' && (
            <Alert color={"danger"}  title={`If you continue to have issues, please contact our support team.`} />
          )}
  
          <div className="text-sm text-white/50">
            <p>
              Need help?{' '}
              <Link
                href="/contact"
                className="text-sm text-light_blue-500 animate-pulse "
              >
                Contact Support
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
      </>
    );
  }