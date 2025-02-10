import { authOptions } from "@/lib/auth/authOptions";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";
import { CheckCircle, XCircle } from "lucide-react";
import { Button, Card, CardBody } from "@heroui/react";
import { supabase } from "@/lib/database/supabase";
import UpdateSession from "./updateSession";
import ErrorAction from "./content/errorAction";

function getErrorMessage(errorType: string | null): string {
  switch (errorType) {
    case 'INVALID_TOKEN':
      return 'The verification link appears to be invalid. Please request a new verification email.';
    case 'TOKEN_EXPIRED':
      return 'This verification link has expired. Please request a new verification email.';
    case 'EMAIL_MISMATCH':
      return 'There was a mismatch with your email address. Please ensure you\'re using the correct verification link.';
    default:
      return 'We encountered an unexpected error while verifying your email. Please try again.';
  }
}

export default async function VerificationContent({ token }: { token: string | null }) {
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
  
      const session = await getServerSession(authOptions);
      if (session?.user?.email !== verif.email) {
        throw new Error("EMAIL_MISMATCH");
      }

      const { error } = await supabase.from("users")
      .update({ email_verified: true })
      .eq("email", verif.email);

      if (error) {
        throw new Error("EMAIL_MISMATCH");
      }
  
    } catch (e: any) {
      console.error(e);
      verificationStatus = "error";
      errorType = e.message;
    }
  
    const states = {
      success: {
        icon: <CheckCircle className="w-16 h-16 text-success" />,
        title: "Email Verified Successfully!",
        message: "Your email has been successfully verified. You can now access all features of DigiGrowing.",
        action: (
          <UpdateSession/>
        )
      },
      error: {
        icon: <XCircle className="w-16 h-16 text-danger" />,
        title: "Verification Failed",
        message: getErrorMessage(errorType),
        action: (
          <ErrorAction/>
        )
      }
    };
  
    const currentState = states[verificationStatus];
  
    return (
      <>
      <Card>
        <CardBody className="flex flex-col items-center text-center p-8 space-y-6">
          {currentState.icon}
          
          <h1 className="text-2xl font-bold">
            {currentState.title}
          </h1>
          
          <p className="text-gray-600">
            {currentState.message}
          </p>
          
          {currentState.action}
  
          {verificationStatus === 'error' && (
            <Card className="bg-danger-50 border-danger-200 w-full">
              <CardBody>
                <p className="text-danger text-sm">
                  If you continue to have issues, please contact our support team.
                </p>
              </CardBody>
            </Card>
          )}
  
          <div className="text-sm text-gray-500">
            <p>
              Need help?{' '}
              <Button 
                href="/contact"
                as="a"
                variant="light"
                color="primary"
                className="p-0 h-auto font-normal"
              >
                Contact Support
              </Button>
            </p>
          </div>
        </CardBody>
      </Card>
      </>
    );
  }