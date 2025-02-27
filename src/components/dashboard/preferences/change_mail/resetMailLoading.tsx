import { Card, CardBody, Spinner } from "@heroui/react";

export default function ResetMailLoading() {
  return (
    <Card className="w-full">
      <CardBody className="flex flex-col items-center text-center p-8 space-y-6">
        <Spinner size="lg" color="primary" />
        <h1 className="text-2xl font-bold">
          Verifying Your Email for Reseting
        </h1>
        <p className="text-gray-600">
          Please check your inbox for the email reset link. If you don`t see it,
          make sure to check your spam or junk folder.
        </p>
      </CardBody>
    </Card>
  );
}
