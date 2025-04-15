import React from "react";
import { useMutation } from "@apollo/client";
import REVIEW_REPORT_MUTATION from "../../graphql/reviewReportMutation.ts";

interface ModerationTileProps {
  reportId: number;
  reportType: "user" | "publication" | "comment";
  title: string;
  contentType: string;
  reportCount: number;
  onDecision: () => void; // Callback après une action
}

const ModerationTile = ({
  reportId,
  reportType,
  title,
  contentType,
  reportCount,
  onDecision
}: ModerationTileProps) => {
  const [reviewReport, { loading }] = useMutation(REVIEW_REPORT_MUTATION);

  const handleDecision = async (isSafe: boolean) => {
    try {
      const { data } = await reviewReport({
        variables: {
          reportId,
          reportType,
          isSafe
        }
      });

      if (data?.reviewReport?.success) {
        alert(`Action ${isSafe ? "d'approbation" : "de bannissement"} réussie`);
        onDecision();
      } else {
        alert("Erreur lors du traitement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
    }
  };

  const getBadgeColor = () => {
    switch(contentType) {
      case "publication": return "bg-purple-100 text-purple-800";
      case "user": return "bg-blue-100 text-blue-800";
      case "comment": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow-md border-l-4 border-gray-300 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getBadgeColor()}`}>
              {contentType}
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
              {reportCount} report{reportCount > 1 ? "s" : ""}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors flex items-center gap-1`}
          >
            {loading ? (
              "Traitement..."
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </>
            )}
          </button>
          
          <button
            onClick={() => handleDecision(false)}
            disabled={loading}
            className={`px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors flex items-center gap-1 ${loading ? "opacity-50" : ""}`}
          >
            {loading ? (
              "Traitement..."
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Ban
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationTile;