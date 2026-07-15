import PLANS from "../data/plans";

export async function downloadReportAsPDF(data: any) {
  const recPlanName = data.recommended_plan?.plan_name?.toLowerCase() || "";
  let matchedIndex = PLANS.findIndex(p => {
    const planNameLower = p.name.toLowerCase();
    if (planNameLower === "customize") {
      return recPlanName.includes("custom") || recPlanName.includes("customize");
    }
    return recPlanName.includes(planNameLower);
  });
  if (matchedIndex === -1) {
    matchedIndex = 0; // Default fallback to Basic plan
  }
  const matchedPlan = PLANS[matchedIndex];

  const bizName = data.business_profile?.business_name || "Business";
  const sanitizedName = bizName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const filename = `report_${sanitizedName}.pdf`;

  // Load jsPDF from CDN dynamically if it is not already loaded
  await new Promise<void>((resolve, reject) => {
    if ((window as any).jspdf) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error("Failed to load jsPDF library"));
    };
    document.head.appendChild(script);
  });

  const jspdfModule = (window as any).jspdf;
  if (!jspdfModule || !jspdfModule.jsPDF) {
    throw new Error("jsPDF constructor not available");
  }

  // Create a new A4 portrait document (A4 is 210mm x 297mm)
  const doc = new jspdfModule.jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let currentY = 15;
  const marginX = 15;
  const contentWidth = 180;
  const pageHeight = 297;
  const footerHeight = 15;
  const maxY = pageHeight - footerHeight;

  // Helper to draw standard page header
  const drawHeader = () => {
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("BUSINESS AUDIT REPORT", marginX, currentY + 6);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Prepared for: ${bizName}`, marginX, currentY + 11);

    // Date
    const dateStr = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(dateStr, marginX + contentWidth, currentY + 11, { align: "right" });

    // Header divider line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(marginX, currentY + 14, marginX + contentWidth, currentY + 14);

    currentY += 20;
  };

  // Helper to draw color-coded pill tags
  const drawPills = (items: string[], startX: number, startY: number, maxWidth: number, colorType: 'gray' | 'orange', dryRun = false) => {
    let currentX = startX;
    let currentY = startY;
    const pillHeight = 4.2;
    const gapX = 1.2;
    const gapY = 1.2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);

    items.forEach((item) => {
      const textW = doc.getTextWidth(item);
      const pillW = textW + 3; // padding

      if (currentX + pillW > startX + maxWidth) {
        currentX = startX;
        currentY += pillHeight + gapY;
      }

      if (!dryRun) {
        if (colorType === 'gray') {
          doc.setFillColor(243, 244, 246); // gray-100
          doc.setDrawColor(229, 231, 235); // gray-200
          doc.setTextColor(55, 65, 81); // gray-700
        } else {
          doc.setFillColor(255, 245, 241); // orange-50
          doc.setDrawColor(255, 225, 214); // orange-100
          doc.setTextColor(255, 89, 36); // orange-600
        }

        doc.setLineWidth(0.15);
        doc.roundedRect(currentX, currentY, pillW, pillHeight, 0.8, 0.8, "FD");
        doc.text(item, currentX + 1.5, currentY + 3);
      }

      currentX += pillW + gapX;
    });

    return currentY + pillHeight - startY; // returns vertical height consumed
  };

  // Helper to draw a circle arc clockwise using line segments
  const drawArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number, strokeWidth: number, color: [number, number, number]) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(strokeWidth);
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;
    const step = 0.03; // step size in radians (smooth segments)
    
    for (let theta = startRad; theta < endRad; theta += step) {
      const nextTheta = Math.min(theta + step, endRad);
      const x1 = cx + r * Math.cos(theta);
      const y1 = cy + r * Math.sin(theta);
      const x2 = cx + r * Math.cos(nextTheta);
      const y2 = cy + r * Math.sin(nextTheta);
      doc.line(x1, y1, x2, y2);
    }
  };

  // Helper to draw a checklist badge in the action items table
  const drawTableBadge = (x: number, y: number, text: string, type: 'green' | 'orange' | 'red') => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    const txtW = doc.getTextWidth(text);
    const badgeW = txtW + 3;
    const badgeH = 3.5;

    if (type === 'green') {
      doc.setFillColor(209, 250, 229); // green-100
      doc.setTextColor(5, 150, 105); // green-600
    } else if (type === 'orange') {
      doc.setFillColor(254, 243, 199); // orange-100
      doc.setTextColor(217, 119, 6); // orange-600
    } else {
      doc.setFillColor(254, 226, 226); // red-100
      doc.setTextColor(220, 38, 38); // red-600
    }

    doc.roundedRect(x, y, badgeW, badgeH, 0.6, 0.6, "F");
    doc.text(text, x + 1.5, y + 2.5);
  };

  // Helper to draw a custom business impact indicator
  const drawImpactCircle = (x: number, y: number, impact: string) => {
    doc.setLineWidth(0.2);
    const impUpper = impact.toUpperCase();
    if (impUpper === "HIGH") {
      doc.setFillColor(16, 185, 129); // solid green
      doc.setDrawColor(16, 185, 129);
      doc.circle(x, y, 1.8, "FD");
    } else if (impUpper === "MEDIUM") {
      // Half filled orange
      doc.setFillColor(245, 158, 11); // orange
      doc.setDrawColor(245, 158, 11);
      doc.circle(x, y, 1.8, "FD");
      // cover left half with white
      doc.setFillColor(255, 255, 255);
      doc.rect(x - 2, y - 2, 2, 4, "F");
      doc.circle(x, y, 1.8, "S");
    } else {
      // LOW: 3/4 white, 1/4 red
      doc.setFillColor(239, 68, 68); // red
      doc.setDrawColor(239, 68, 68);
      doc.circle(x, y, 1.8, "FD");
      doc.setFillColor(255, 255, 255);
      doc.rect(x - 2, y - 2, 2, 4, "F");
      doc.rect(x, y - 2, 2, 2, "F");
      doc.circle(x, y, 1.8, "S");
    }
  };

  // Helper to draw a custom difficulty indicator
  const drawDifficultyCircle = (x: number, y: number, difficulty: string) => {
    doc.setLineWidth(0.2);
    const diffUpper = difficulty.toUpperCase();
    if (diffUpper === "EASY") {
      doc.setFillColor(16, 185, 129); // solid green
      doc.setDrawColor(16, 185, 129);
      doc.circle(x, y, 1.8, "FD");
    } else if (diffUpper === "MEDIUM") {
      // Half filled orange
      doc.setFillColor(245, 158, 11); // orange
      doc.setDrawColor(245, 158, 11);
      doc.circle(x, y, 1.8, "FD");
      doc.setFillColor(255, 255, 255);
      doc.rect(x - 2, y - 2, 2, 4, "F");
      doc.circle(x, y, 1.8, "S");
    } else {
      // HIGH: 3/4 filled red (leaves top-left quadrant white)
      doc.setFillColor(239, 68, 68); // red
      doc.setDrawColor(239, 68, 68);
      doc.circle(x, y, 1.8, "FD");
      doc.setFillColor(255, 255, 255);
      doc.rect(x - 2, y - 2, 2, 2, "F");
      doc.circle(x, y, 1.8, "S");
    }
  };

  // Initialize first page header
  drawHeader();

  // 1. EXECUTIVE SUMMARY SECTION (WITH DONUT SCORE RING CARD)
  const drawExecutiveSummary = () => {
    const startY = currentY;

    // A. Left Side: Overall Score Donut Card (Width: 50mm, Height: 54mm)
    const donutCardW = 50;
    const donutCardH = 54;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 230, 238); // E2E6EE
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, startY, donutCardW, donutCardH, 5, 5, "FD");

    // Donut track & progress arcs (open at bottom-center: 150deg to 390deg)
    const cx = marginX + donutCardW / 2;
    const cy = startY + 23;
    const r = 13.5;
    const scoreVal = data.executive_summary?.overall_score || 5;

    // Track (gray)
    drawArc(cx, cy, r, 150, 390, 2.5, [241, 244, 249]);

    // Progress
    let progressColor: [number, number, number] = [255, 89, 36]; // orange
    if (scoreVal >= 8) progressColor = [16, 185, 129]; // green
    else if (scoreVal < 5) progressColor = [239, 68, 68]; // red

    const progressEndDeg = 150 + (scoreVal / 10) * 240;
    drawArc(cx, cy, r, 150, progressEndDeg, 2.5, progressColor);

    // Score Text in Donut Center
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(17, 20, 24); // #111418
    doc.text(`${scoreVal}`, cx, cy + 3.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(116, 130, 151); // #748297
    doc.text("OVERALL SCORE", cx, cy + 11, { align: "center" });

    // B. Right Side: Text & Highlights (Width: 124mm)
    const textColX = marginX + 56;
    
    // Section Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 89, 36); // #FF5924
    doc.text("EXECUTIVE AUDIT SUMMARY", textColX, startY + 4);

    doc.setDrawColor(255, 89, 36);
    doc.setLineWidth(0.8);
    doc.line(textColX, startY + 6, textColX + 22, startY + 6);

    // Summary Text
    const summaryText = data.executive_summary?.summary || "";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // slate-700
    const splitSummary = doc.splitTextToSize(summaryText, 124);
    doc.text(splitSummary, textColX, startY + 12);

    // Top Strength box
    const strengthY = startY + 32;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 230, 238);
    doc.setLineWidth(0.2);
    doc.roundedRect(textColX, strengthY, 124, 22, 4, 4, "FD");

    // Left green accent border
    doc.setFillColor(16, 185, 129); // green
    doc.rect(textColX, strengthY, 1.5, 22, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70); // green-800
    doc.text("TOP STRENGTH", textColX + 5, strengthY + 6);

    const strengthVal = data.executive_summary?.top_strength || "N/A";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(6, 78, 59); // green-900
    const splitStrength = doc.splitTextToSize(strengthVal, 114);
    doc.text(splitStrength, textColX + 5, strengthY + 12);

    currentY = startY + 58 + 6;
  };

  // 2. BUSINESS PROFILE & DIGITAL PERFORMANCE SCORECARD (SIDE-BY-SIDE)
  const drawProfileAndScorecard = () => {
    const startY = currentY;
    const cardW = 87;
    
    // Row measurements
    const profileRows = [
      { label: "Company Name", value: data.business_profile?.business_name || "N/A", type: "text" },
      { label: "Industry", value: data.business_profile?.industry || "N/A", type: "text" },
      { label: "Location", value: data.business_profile?.location || "N/A", type: "text" },
      { label: "Business Model", value: data.business_profile?.business_model || "N/A", type: "text" },
      { label: "Target Audience", value: data.business_profile?.target_audience || [], type: "pills_gray" },
      { label: "Revenue Channels", value: data.business_profile?.revenue_sources || [], type: "pills_orange" }
    ];

    // Dry run calculations for height (pills calculated without drawing)
    let dryY = startY + 12;
    profileRows.forEach((row) => {
      let rHeight = 8;
      if (row.type === "pills_gray") {
        const dummyH = drawPills(row.value as string[], 0, 0, 41, 'gray', true);
        rHeight = Math.max(8, dummyH + 3.5);
      } else if (row.type === "pills_orange") {
        const dummyH = drawPills(row.value as string[], 0, 0, 41, 'orange', true);
        rHeight = Math.max(8, dummyH + 3.5);
      }
      dryY += rHeight;
    });
    
    const cardHeight = dryY - startY + 2;
    const finalStartY = currentY;

    // A. Left Side: Business Profile Card
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 20, 24);
    doc.text("Business Profile", marginX, finalStartY + 6);

    const profileStartY = finalStartY + 10;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 230, 238);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, profileStartY, cardW, cardHeight, 5, 5, "FD");

    let rowY = profileStartY + 4;
    profileRows.forEach((row, rIdx) => {
      // Row separator
      if (rIdx > 0) {
        doc.setDrawColor(241, 244, 249);
        doc.setLineWidth(0.2);
        doc.line(marginX + 5, rowY, marginX + cardW - 5, rowY);
      }

      rowY += 2;

      // Draw Row Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(116, 130, 151); // slate gray
      doc.text(row.label, marginX + 6, rowY + 4);

      let rHeight = 8;
      if (row.type === "text") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(17, 20, 24);
        doc.text(row.value as string, marginX + cardW - 6, rowY + 4, { align: "right" });
      } else if (row.type === "pills_gray") {
        const heightConsumed = drawPills(row.value as string[], marginX + 40, rowY + 1, 41, 'gray');
        rHeight = Math.max(8, heightConsumed + 3);
      } else if (row.type === "pills_orange") {
        const heightConsumed = drawPills(row.value as string[], marginX + 40, rowY + 1, 41, 'orange');
        rHeight = Math.max(8, heightConsumed + 3);
      }

      rowY += rHeight;
    });

    // B. Right Side: Digital Performance Scorecard Card
    const rightColX = marginX + 93;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 20, 24);
    doc.text("Digital Performance Scorecard", rightColX, finalStartY + 6);

    const chartStartY = finalStartY + 10;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 230, 238);
    doc.setLineWidth(0.3);
    doc.roundedRect(rightColX, chartStartY, cardW, cardHeight, 5, 5, "FD");

    // Grid coordinates
    const gridLeft = rightColX + 11;
    const gridW = 68;
    const gridH = cardHeight - 34; // dynamic vertical space
    const gridBottom = chartStartY + 12 + gridH;

    // Draw horizontal guidelines & Y-axis coordinates
    doc.setDrawColor(241, 244, 249);
    doc.setLineWidth(0.18);
    for (let i = 1; i <= 10; i++) {
      const lineY = gridBottom - (i / 10) * gridH;
      doc.line(gridLeft, lineY, gridLeft + gridW, lineY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(116, 130, 151);
      doc.text(i.toString(), gridLeft - 3, lineY + 2.2, { align: "right" });
    }

    // Chart datasets
    const scorecardChartData = [
      { name: "Website Usability", score: data.business_scorecard?.website || 0 },
      { name: "Branding & Visuals", score: data.business_scorecard?.branding || 0 },
      { name: "Marketing Strategy", score: data.business_scorecard?.marketing || 0 },
      { name: "Social Media", score: data.business_scorecard?.social_media || 0 },
      { name: "Growth Readiness", score: data.business_scorecard?.growth_readiness || 0 }
    ];

    // Draw vertical bars
    scorecardChartData.forEach((item, idx) => {
      const colW = 6.5;
      const colX = gridLeft + 4.5 + idx * 12.8;
      const barH = (item.score / 10) * gridH;
      const barY = gridBottom - barH;

      // Color coding rules
      let col: [number, number, number] = [255, 89, 36]; // orange
      if (item.score >= 8) col = [16, 185, 129]; // green
      else if (item.score < 5) col = [239, 68, 68]; // red

      // 1. Gray track background
      doc.setFillColor(241, 244, 249);
      doc.roundedRect(colX, chartStartY + 12, colW, gridH, 1, 1, "F");

      // 2. Bar fill progress with rounded top corners
      if (barH > 0) {
        doc.setFillColor(col[0], col[1], col[2]);
        doc.roundedRect(colX, barY, colW, barH, 1, 1, "F");
        // Flatten bottom part if tall enough
        if (barH > 2) {
          doc.rect(colX, gridBottom - 1.5, colW, 1.5, "F");
        }
      }

      // X-Axis labels rotated 45 degrees
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(116, 130, 151);
      doc.text(item.name, colX + 3.2, gridBottom + 4.5, { angle: 315 });
    });

    currentY = finalStartY + cardHeight + 16;
  };

  // 3. COMPETITIVE OVERVIEW & RISK ASSESSMENT (SIDE-BY-SIDE - BOTTOM OF PAGE 1)
  const drawCompetitiveAndRisk = () => {
    const startY = currentY;
    const cardW = 87;
    const cardH = 68;

    // A. Left Side: Competitive Overview
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 20, 24);
    doc.text("Competitive Overview", marginX, startY + 6);

    const compStartY = startY + 10;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 230, 238);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, compStartY, cardW, cardH, 5, 5, "FD");

    // Row 1: Competitive Index Score
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(116, 130, 151);
    doc.text("Competitive Index", marginX + 6, compStartY + 8);
    
    const compScore = data.competitor_analysis?.competitive_score || 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 89, 36);
    doc.text(`${compScore} / 10`, marginX + cardW - 6, compStartY + 8, { align: "right" });

    doc.setDrawColor(241, 244, 249);
    doc.setLineWidth(0.2);
    doc.line(marginX + 5, compStartY + 12, marginX + cardW - 5, compStartY + 12);

    // Row 2: Competitor Focus tags
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("COMPETITOR FOCUS", marginX + 6, compStartY + 17);

    const competitors = data.competitor_analysis?.major_competitors || [];
    drawPills(competitors.slice(0, 6), marginX + 6, compStartY + 20, cardW - 12, 'gray');

    doc.setDrawColor(241, 244, 249);
    doc.line(marginX + 5, compStartY + 36, marginX + cardW - 5, compStartY + 36);

    // Row 3: Opportunity Advantage
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("OPPORTUNITY ADVANTAGE", marginX + 6, compStartY + 41);

    const advantage = data.competitor_analysis?.key_advantage || "N/A";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const splitAdv = doc.splitTextToSize(advantage, cardW - 12);
    doc.text(splitAdv.slice(0, 2), marginX + 6, compStartY + 45);

    doc.setDrawColor(241, 244, 249);
    doc.line(marginX + 5, compStartY + 54, marginX + cardW - 5, compStartY + 54);

    // Row 4: Largest Gap
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("LARGEST IDENTIFIED GAP", marginX + 6, compStartY + 58);

    const gap = data.competitor_analysis?.largest_gap || "N/A";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(239, 68, 68); // Red
    const splitGap = doc.splitTextToSize(gap, cardW - 12);
    doc.text(splitGap.slice(0, 1), marginX + 6, compStartY + 62);

    // B. Right Side: Risk Assessment
    const rightColX = marginX + 93;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 20, 24);
    doc.text("Risk Assessment", rightColX, startY + 6);

    const riskStartY = startY + 10;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 230, 238);
    doc.setLineWidth(0.3);
    doc.roundedRect(rightColX, riskStartY, cardW, cardH, 5, 5, "FD");

    // Row 1: Overall Risk Level
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(116, 130, 151);
    doc.text("Overall Risk Level", rightColX + 6, riskStartY + 8);
    
    const riskLevel = data.risk_assessment?.overall_risk || "Moderate";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 89, 36);
    doc.text(riskLevel, rightColX + cardW - 6, riskStartY + 8, { align: "right" });

    doc.setDrawColor(241, 244, 249);
    doc.line(rightColX + 5, riskStartY + 12, rightColX + cardW - 5, riskStartY + 12);

    // Row 2: Risk Rating Score
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(116, 130, 151);
    doc.text("Risk Rating Score", rightColX + 6, riskStartY + 19);

    const riskScore = data.risk_assessment?.risk_score || 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(17, 20, 24);
    doc.text(`${riskScore} / 10`, rightColX + cardW - 6, riskStartY + 19, { align: "right" });

    doc.line(rightColX + 5, riskStartY + 24, rightColX + cardW - 5, riskStartY + 24);

    // Row 3: Top Critical Risks Bullet Points
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("TOP CRITICAL RISKS", rightColX + 6, riskStartY + 30);

    const risks = data.risk_assessment?.top_risks || [];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    risks.slice(0, 3).forEach((riskText: string, rIdx: number) => {
      const rowY = riskStartY + 36 + rIdx * 8;
      // Draw red dot bullet point
      doc.setFillColor(239, 68, 68);
      doc.circle(rightColX + 8, rowY + 1.2, 0.7, "F");

      const splitRisk = doc.splitTextToSize(riskText, cardW - 14);
      doc.text(splitRisk[0] || "", rightColX + 11, rowY + 2);
    });
  };

  // PAGE 2 INITIALIZATION (DETERMINISTIC SPLIT)
  const drawPage2 = () => {
    doc.addPage();
    currentY = 15;
    drawHeader();
  };

  // 4. SWOT MATRIX KEY FINDINGS (2x2 GRID)
  const drawSWOT = () => {
    const startY = currentY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 20, 24);
    doc.text("SWOT Key Findings", marginX, startY + 4);

    const swotStartY = startY + 8;
    const cardW = 87;
    const cardH = 30;

    const swotBoxes = [
      {
        title: "STRENGTHS",
        items: data.key_findings?.strengths || [],
        bgColor: [240, 253, 244],
        borderColor: [187, 247, 208],
        titleColor: [22, 101, 52],
        x: marginX,
        y: swotStartY,
        type: "check"
      },
      {
        title: "WEAKNESSES",
        items: data.key_findings?.weaknesses || [],
        bgColor: [254, 242, 242],
        borderColor: [254, 202, 202],
        titleColor: [153, 27, 27],
        x: marginX + 93,
        y: swotStartY,
        type: "alert"
      },
      {
        title: "OPPORTUNITIES",
        items: data.key_findings?.opportunities || [],
        bgColor: [239, 246, 255],
        borderColor: [191, 219, 254],
        titleColor: [30, 64, 175],
        x: marginX,
        y: swotStartY + 34,
        type: "target"
      },
      {
        title: "THREATS",
        items: data.key_findings?.threats || [],
        bgColor: [255, 251, 235],
        borderColor: [253, 230, 138],
        titleColor: [133, 77, 14],
        x: marginX + 93,
        y: swotStartY + 34,
        type: "danger"
      }
    ];

    swotBoxes.forEach((box) => {
      // Background card
      doc.setFillColor(box.bgColor[0], box.bgColor[1], box.bgColor[2]);
      doc.setDrawColor(box.borderColor[0], box.borderColor[1], box.borderColor[2]);
      doc.setLineWidth(0.25);
      doc.roundedRect(box.x, box.y, cardW, cardH, 3, 3, "FD");

      // Draw custom icon
      const iconX = box.x + 5;
      const iconY = box.y + 5;
      if (box.type === "check") {
        doc.setDrawColor(16, 185, 129);
        doc.setFillColor(220, 252, 231);
        doc.setLineWidth(0.2);
        doc.circle(iconX, iconY, 2, "FD");
        doc.setLineWidth(0.35);
        doc.line(iconX - 0.8, iconY, iconX - 0.2, iconY + 0.6);
        doc.line(iconX - 0.2, iconY + 0.6, iconX + 0.8, iconY - 0.6);
      } else if (box.type === "alert") {
        doc.setDrawColor(239, 68, 68);
        doc.setFillColor(254, 226, 226);
        doc.setLineWidth(0.2);
        doc.circle(iconX, iconY, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5);
        doc.setTextColor(239, 68, 68);
        doc.text("!", iconX, iconY + 1.6, { align: "center" });
      } else if (box.type === "target") {
        doc.setDrawColor(59, 130, 246);
        doc.setFillColor(219, 234, 254);
        doc.setLineWidth(0.2);
        doc.circle(iconX, iconY, 2, "FD");
        doc.circle(iconX, iconY, 0.8, "S");
      } else {
        doc.setDrawColor(245, 158, 11);
        doc.setFillColor(254, 243, 199);
        doc.setLineWidth(0.2);
        doc.circle(iconX, iconY, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5);
        doc.setTextColor(245, 158, 11);
        doc.text("?", iconX, iconY + 1.6, { align: "center" });
      }

      // Box Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(box.titleColor[0], box.titleColor[1], box.titleColor[2]);
      doc.text(box.title, box.x + 9, box.y + 6.5);

      // Box items (Max 3 items to fit safely)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      const listItems = box.items.slice(0, 3);
      listItems.forEach((bulletText: string, bIdx: number) => {
        const rowY = box.y + 11.5 + bIdx * 5.5;
        doc.text("•", box.x + 5, rowY);
        const splitText = doc.splitTextToSize(bulletText, cardW - 10);
        doc.text(splitText[0] || "", box.x + 8, rowY);
      });
    });

    currentY = swotStartY + 64 + 8;
  };

  // 5. RECOMMENDED PRIORITY ACTION CHECKLIST (MIDDLE OF PAGE 2)
  const drawPriorityChecklist = () => {
    const startY = currentY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 20, 24);
    doc.text("Recommended Priority Action Checklist", marginX, startY + 4);

    const checklistStartY = startY + 8;
    const checklistW = contentWidth;
    const checklistH = 46;

    // Draw white container card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 230, 238);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, checklistStartY, checklistW, checklistH, 5, 5, "FD");

    // Draw Column Headers
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("#", marginX + 5, checklistStartY + 7);
    doc.text("ACTION ITEM", marginX + 12, checklistStartY + 7);
    doc.text("BUSINESS IMPACT", marginX + 125, checklistStartY + 7);
    doc.text("DIFFICULTY", marginX + 152, checklistStartY + 7);

    // Separator below headers
    doc.setDrawColor(241, 244, 249);
    doc.setLineWidth(0.2);
    doc.line(marginX + 4, checklistStartY + 10, marginX + checklistW - 4, checklistStartY + 10);

    // Draw Rows (Max 3 actions from priority_actions)
    const actions = (data.priority_actions || []).slice(0, 3);
    let rowY = checklistStartY + 14;

    actions.forEach((item: any, idx: number) => {
      // Row index
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(116, 130, 151);
      doc.text(`${idx + 1}`, marginX + 5, rowY + 3);

      // Action Title
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(item.title, marginX + 12, rowY + 3);

      // Business Impact Icon & Badge
      const impactVal = item.impact || "Medium";
      drawImpactCircle(marginX + 127.5, rowY + 2.2, impactVal);
      
      const impColor = impactVal.toUpperCase() === "HIGH" ? "green" : (impactVal.toUpperCase() === "MEDIUM" ? "orange" : "red");
      drawTableBadge(marginX + 131, rowY + 0.5, impactVal.toUpperCase(), impColor);

      // Difficulty Icon & Badge
      const diffVal = item.difficulty || "Medium";
      drawDifficultyCircle(marginX + 154.5, rowY + 2.2, diffVal);

      const diffColor = diffVal.toUpperCase() === "EASY" ? "green" : (diffVal.toUpperCase() === "MEDIUM" ? "orange" : "red");
      drawTableBadge(marginX + 158, rowY + 0.5, diffVal.toUpperCase(), diffColor);

      // Row separator (except last row)
      if (idx < actions.length - 1) {
        doc.setDrawColor(241, 244, 249);
        doc.setLineWidth(0.2);
        doc.line(marginX + 4, rowY + 6.5, marginX + checklistW - 4, rowY + 6.5);
      }

      rowY += 10;
    });

    currentY = checklistStartY + checklistH + 8;
  };

  // 6. 90-DAY IMPLEMENTATION ROADMAP (3 COLUMNS - BOTTOM OF PAGE 2)
  const drawRoadmap = () => {
    const startY = currentY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 20, 24);
    doc.text("90-Day Implementation Roadmap", marginX, startY + 4);

    const roadmapStartY = startY + 8;
    const stages = [
      { key: "30_days", title: "DAYS 1 - 30" },
      { key: "60_days", title: "DAYS 31 - 60" },
      { key: "90_days", title: "DAYS 61 - 90" }
    ];

    stages.forEach((stage, idx) => {
      const colX = marginX + idx * 61;
      const colW = 58;
      const colH = 41;

      // Card wrapper
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 230, 238);
      doc.setLineWidth(0.2);
      doc.roundedRect(colX, roadmapStartY, colW, colH, 4, 4, "FD");

      // Header label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 89, 36);
      doc.text(stage.title, colX + 4, roadmapStartY + 6);

      // Dashed divider line
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.15);
      doc.line(colX + 4, roadmapStartY + 8, colX + colW - 4, roadmapStartY + 8);

      // Stage list tasks (Max 4)
      const tasks = (data.roadmap?.[stage.key as any] || []).slice(0, 4);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);

      tasks.forEach((taskText: string, tIdx: number) => {
        const rowY = roadmapStartY + 13 + tIdx * 6.5;
        doc.text("•", colX + 4, rowY);
        const splitText = doc.splitTextToSize(taskText, colW - 8);
        doc.text(splitText[0] || "", colX + 7, rowY);
      });
    });

    currentY = roadmapStartY + 41 + 8;
  };

  // PAGE 3 INITIALIZATION (DETERMINISTIC SPLIT)
  const drawPage3 = () => {
    doc.addPage();
    currentY = 15;
    drawHeader();
  };

  // 7. RECOMMENDED PLAN CARD, ADD-ONS & EXPECTED MILESTONES (PAGE 3 - DESIGN INTEGRATION)
  const drawRecommendedPlanPage = () => {
    const startY = currentY;

    // Draw main wrapper card
    const cardW = contentWidth;
    const cardH = 175;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 230, 238);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, startY, cardW, cardH, 5, 5, "FD");

    // Part A: Rationale & Confidence Donut (Side-by-side)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 20, 24);
    doc.text("Why this plan fits your business", marginX + 6, startY + 10);

    const rationale = data.recommended_plan?.reason || "";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    const splitRationale = doc.splitTextToSize(rationale, 115);
    doc.text(splitRationale, marginX + 6, startY + 18);

    // Confidence Donut on the right (Width: 35mm)
    const confCx = marginX + 148;
    const confCy = startY + 22;
    const confR = 12;
    const confidenceScore = data.recommended_plan?.confidence || 80;

    // Full 360 donut track (gray)
    drawArc(confCx, confCy, confR, 0, 360, 2.5, [241, 244, 249]);
    // Progress track starting from top (270 degrees) going clockwise
    const confProgressEnd = 270 + (confidenceScore / 100) * 360;
    drawArc(confCx, confCy, confR, 270, confProgressEnd, 2.5, [255, 89, 36]); // orange

    // Center text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(17, 20, 24);
    doc.text(`${confidenceScore}%`, confCx, confCy + 2, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text("CONFIDENCE", confCx, confCy + 6, { align: "center" });

    // Separator below rationale
    doc.setDrawColor(241, 244, 249);
    doc.setLineWidth(0.2);
    doc.line(marginX + 6, startY + 48, marginX + cardW - 6, startY + 48);

    // Part B: Recommended Add-ons for Extra Growth
    const addOnStartY = startY + 54;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 20, 24);
    doc.text("Recommended Add-ons for Extra Growth", marginX + 6, addOnStartY);

    const addOns = data.add_ons || [];
    let addOnY = addOnStartY + 4;

    addOns.slice(0, 2).forEach((addon: any, idx: number) => {
      const boxH = 18;
      // White subcard with light orange border
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(255, 237, 213); // orange-100
      doc.setLineWidth(0.25);
      doc.roundedRect(marginX + 6, addOnY, cardW - 12, boxH, 4, 4, "FD");

      // Add-on Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(17, 20, 24);
      doc.text(addon.service, marginX + 11, addOnY + 6);

      // Priority Badge next to title
      const titleW = doc.getTextWidth(addon.service);
      const badgeX = marginX + 11 + titleW + 3;
      const priorityText = (addon.priority || "HIGH") + " PRIORITY";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      const pBadgeW = doc.getTextWidth(priorityText) + 3;
      
      // Color coding priority badge
      if (priorityText.includes("HIGH")) {
        doc.setFillColor(254, 226, 226); // red-100
        doc.setTextColor(220, 38, 38); // red-600
      } else {
        doc.setFillColor(254, 243, 199); // yellow-100
        doc.setTextColor(217, 119, 6); // yellow-600
      }
      doc.roundedRect(badgeX, addOnY + 3.2, pBadgeW, 3.5, 0.6, 0.6, "F");
      doc.text(priorityText, badgeX + 1.5, addOnY + 5.7);

      // Add-on Reason Description
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      const splitReason = doc.splitTextToSize(addon.reason, cardW - 60);
      doc.text(splitReason[0] || "", marginX + 11, addOnY + 12);

      // Optional Add-on badge on the far right
      const optText = "Optional Add-on";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      const optW = doc.getTextWidth(optText) + 4;
      const optX = marginX + cardW - 11 - optW;
      
      doc.setFillColor(255, 251, 235); // orange-50
      doc.setDrawColor(254, 215, 170); // orange-200
      doc.setLineWidth(0.2);
      doc.roundedRect(optX, addOnY + 6, optW, 6, 1.2, 1.2, "FD");
      
      doc.setTextColor(217, 119, 6);
      doc.text(optText, optX + 2, addOnY + 10.2);

      addOnY += boxH + 3.5;
    });

    // Separator below add-ons
    doc.setDrawColor(241, 244, 249);
    doc.setLineWidth(0.2);
    doc.line(marginX + 6, startY + 105, marginX + cardW - 6, startY + 105);

    // Part C: Expected Growth Results
    const resultsStartY = startY + 112;
    
    // Draw target icon (concentric circles)
    doc.setDrawColor(255, 89, 36);
    doc.setLineWidth(0.35);
    doc.circle(marginX + 9, resultsStartY + 3, 2, "S");
    doc.circle(marginX + 9, resultsStartY + 3, 0.8, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 20, 24);
    doc.text("Expected Growth Results", marginX + 13, resultsStartY + 4);

    const milestones = data.recommended_plan?.expected_results || [];
    let milestoneY = resultsStartY + 9;

    // Render milestone blocks as cards side-by-side or wrapped
    milestones.slice(0, 3).forEach((milestone: string, mIdx: number) => {
      const blockW = 52;
      const blockH = 14;
      const blockX = marginX + 6 + mIdx * 56;

      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(241, 244, 249);
      doc.setLineWidth(0.2);
      doc.roundedRect(blockX, milestoneY, blockW, blockH, 3, 3, "FD");

      // Draw checkmark ✓ in brand orange
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 89, 36);
      doc.text("✓", blockX + 3.5, milestoneY + 7.5);

      // Milestone text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const splitText = doc.splitTextToSize(milestone, blockW - 10);
      doc.text(splitText.slice(0, 2), blockX + 7.5, milestoneY + 5.5);
    });

    // Separator below milestones
    doc.setDrawColor(241, 244, 249);
    doc.setLineWidth(0.2);
    doc.line(marginX + 6, startY + 138, marginX + cardW - 6, startY + 138);

    // Part D: Footer Recommendation Plan name & price
    const footerStartY = startY + 144;
    
    // Draw solid Orange plan band at the bottom
    doc.setFillColor(255, 89, 36); // brand orange
    doc.roundedRect(marginX + 6, footerStartY, cardW - 12, 24, 4, 4, "F");

    // Plan Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text((matchedPlan.name || "Custom Plan").toUpperCase(), marginX + 12, footerStartY + 7.5);

    // Rational summary short
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(254, 242, 238); // light cream-orange
    const reasonShort = (data.recommended_plan?.reason || "").slice(0, 80) + "...";
    const splitReasonShort = doc.splitTextToSize(reasonShort, 82);
    doc.text(splitReasonShort, marginX + 12, footerStartY + 13.5);

    // Price tag (aligned at X = marginX + 96)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13.5);
    doc.setTextColor(255, 255, 255);
    doc.text(matchedPlan.price, marginX + 96, footerStartY + 7.5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(254, 242, 238);
    const displayPeriod = matchedPlan.period ? "/month" : "";
    doc.text(displayPeriod, marginX + 96, footerStartY + 10.5, { align: "right" });

    // Features List on the Right Side
    const features = matchedPlan.features || [];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);

    // Column 1 (features 0-3)
    features.slice(0, 4).forEach((feat: string, idx: number) => {
      const featY = footerStartY + 6.5 + idx * 4.5;
      doc.text("•", marginX + 102, featY);
      const splitFeat = doc.splitTextToSize(feat, 33);
      doc.text(splitFeat[0] || "", marginX + 104, featY);
    });

    // Column 2 (features 4-7)
    features.slice(4, 8).forEach((feat: string, idx: number) => {
      const featY = footerStartY + 6.5 + idx * 4.5;
      doc.text("•", marginX + 140, featY);
      const splitFeat = doc.splitTextToSize(feat, 32);
      doc.text(splitFeat[0] || "", marginX + 142, featY);
    });
  };

  // Run builders sequentially inside a deterministic 3-page grid
  drawExecutiveSummary();
  drawProfileAndScorecard();
  drawCompetitiveAndRisk();

  // Page 2
  drawPage2();
  drawSWOT();
  drawPriorityChecklist();
  drawRoadmap();

  // Page 3
  drawPage3();
  drawRecommendedPlanPage();

  // Helper to add standard page number footers across all generated pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Page ${i} of ${pageCount}`,
      marginX + contentWidth / 2,
      pageHeight - 9,
      { align: "center" }
    );
  }

  // Save the drawn PDF
  doc.save(filename);
}
