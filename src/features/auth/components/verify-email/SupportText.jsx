import { useTranslation } from "react-i18next";
const SupportText = () => {
  const {
    t
  } = useTranslation();
  return <p className="text-center mt-4" style={{
    fontSize: '0.85rem',
    color: 'var(--text-muted, #6B6B6B)'
  }}>
      {t("auth.canHoTro")}
      <a href="mailto:support@researchpulse.io" style={{
      color: 'var(--primary)',
      textDecoration: 'none',
      fontWeight: 500
    }}>{t("auth.lienHeChungToi")}</a>
    </p>;
};
export default SupportText;