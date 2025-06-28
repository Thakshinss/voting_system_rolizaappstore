import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Thanks() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Please fill out this form
          </h1>

          <p className="mb-6 text-sm text-gray-600 text-center">
            Your vote is received and updated. Now we'd like to collect some additional info.
          </p>

          {/* Google Form embed */}
          <div className="aspect-video w-full">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSc_30z54suLhNZRokO-ZflJF-ARVeztmr-d43NBukHo9xBVfw/viewform?usp=dialog"
              width="100%"
              height="100%"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="Google Form"
              className="w-full h-[500px] rounded-md border"
            >
              Loading…
            </iframe>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
