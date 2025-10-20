import { FaFont, FaEnvelope, FaPhone, FaHashtag, FaCalendarAlt, FaCaretDown, FaAlignLeft, FaCheck } from 'react-icons/fa';

export function getFieldIcon(fieldType: string) {
  const iconStyle = { fontSize: '1.1rem' };

  switch (fieldType) {
    case 'text':
      return <FaFont style={iconStyle} />;
    case 'email':
      return <FaEnvelope style={iconStyle} />;
    case 'tel':
      return <FaPhone style={iconStyle} />;
    case 'number':
      return <FaHashtag style={iconStyle} />;
    case 'date':
      return <FaCalendarAlt style={iconStyle} />;
    case 'select':
      return <FaCaretDown style={iconStyle} />;
    case 'textarea':
      return <FaAlignLeft style={iconStyle} />;
    case 'checkbox':
      return <FaCheck style={iconStyle} />;
    default:
      return <FaFont style={iconStyle} />;
  }
}
