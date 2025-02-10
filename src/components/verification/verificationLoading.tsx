import { Card, CardBody, Spinner } from "@heroui/react";

export default function VerificationLoading() {
  return (
    <Card className="w-full">
      <CardBody className="flex flex-col items-center text-center p-8 space-y-6">
        <Spinner size="lg" color="primary" />
        <h1 className="text-2xl font-bold">
          Verifying Your Email
        </h1>
        <p className="text-gray-600">
          Please wait while we verify your email address...
        </p>
      </CardBody>
    </Card>
  );
}