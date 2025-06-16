interface TextHeadProps {
  text: string;
  textColor: string;
  fontSize: string;
  fontWeight: string;
}

export const TextHead = ({ text, textColor, fontSize, fontWeight }: TextHeadProps) => {
  return (
    <span style={{
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: textColor,
        }}>{text}</span>
  );
};