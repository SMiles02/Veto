import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e1218",
          color: "#f2f5f7",
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        V
      </div>
    ),
    size
  );
}
