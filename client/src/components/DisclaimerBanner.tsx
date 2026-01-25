import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-yellow-800 leading-relaxed">
              <strong className="font-semibold">Disclaimer:</strong> This
              website is <strong>not an official GS1 publication</strong> and is
              currently in development. The content, mappings, and AI-generated
              responses are for{" "}
              <strong>testing and demonstration purposes only</strong> and
              should not be used for compliance decisions or official reporting.
              Always refer to official GS1 documentation and regulatory texts
              for authoritative information.
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-yellow-600 hover:text-yellow-800 transition-colors"
            aria-label="Dismiss disclaimer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
