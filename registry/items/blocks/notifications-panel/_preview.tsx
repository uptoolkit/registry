"use client";

import { sampleViewer } from "../../lib/social-sample-data/social-sample-data";
import { NotificationsPanel } from "./notifications-panel";

export function Preview() {
  return <NotificationsPanel viewer={sampleViewer} />;
}
