import {
  FaFont, FaEnvelope, FaPhone, FaHashtag, FaCalendarAlt, FaCaretDown,
  FaAlignLeft, FaCheck, FaList, FaCheckSquare, FaPaperclip, FaTags,
  FaLink, FaExternalLinkAlt, FaMapMarkerAlt, FaDrawPolygon, FaRoute,
  FaTable, FaEye, FaClock, FaLevelUpAlt
} from 'react-icons/fa';

export function getFieldIcon(fieldType: string) {
  const iconStyle = { fontSize: '1.1rem' };

  switch (fieldType.toLowerCase()) {
    case 'text':
      return <FaFont style={iconStyle} />;
    case 'email':
      return <FaEnvelope style={iconStyle} />;
    case 'tel':
    case 'phone':
      return <FaPhone style={iconStyle} />;
    case 'number':
    case 'number_integer':
    case 'number_decimal':
      return <FaHashtag style={iconStyle} />;
    case 'date':
      return <FaCalendarAlt style={iconStyle} />;
    case 'datetime':
      return <FaClock style={iconStyle} />;
    case 'select':
    case 'codelist':
      return <FaCaretDown style={iconStyle} />;
    case 'multiselect_codelist':
      return <FaCheckSquare style={iconStyle} />;
    case 'textarea':
      return <FaAlignLeft style={iconStyle} />;
    case 'checkbox':
      return <FaCheck style={iconStyle} />;
    case 'attachment':
      return <FaPaperclip style={iconStyle} />;
    case 'label':
      return <FaTags style={iconStyle} />;
    case 'link':
      return <FaLink style={iconStyle} />;
    case 'external_link':
      return <FaExternalLinkAlt style={iconStyle} />;
    case 'point':
    case 'multipoint':
      return <FaMapMarkerAlt style={iconStyle} />;
    case 'linestring':
    case 'multilinestring':
      return <FaRoute style={iconStyle} />;
    case 'polygon':
    case 'multipolygon':
      return <FaDrawPolygon style={iconStyle} />;
    case 'table':
      return <FaTable style={iconStyle} />;
    default:
      return <FaFont style={iconStyle} />;
  }
}

export const FIELD_TYPES = [
  { value: 'text', label: 'Text', category: 'basic' },
  { value: 'email', label: 'Email', category: 'basic' },
  { value: 'tel', label: 'Phone', category: 'basic' },
  { value: 'number', label: 'Number', category: 'basic' },
  { value: 'number_integer', label: 'Integer', category: 'basic' },
  { value: 'number_decimal', label: 'Decimal', category: 'basic' },
  { value: 'date', label: 'Date', category: 'basic' },
  { value: 'datetime', label: 'Date Time', category: 'basic' },
  { value: 'textarea', label: 'Text Area', category: 'basic' },
  { value: 'checkbox', label: 'Checkbox', category: 'basic' },
  { value: 'codelist', label: 'Dropdown', category: 'advanced' },
  { value: 'multiselect_codelist', label: 'Multi-Select', category: 'advanced' },
  { value: 'attachment', label: 'File Upload', category: 'advanced' },
  { value: 'label', label: 'Label/Header', category: 'layout' },
  { value: 'link', label: 'Link', category: 'advanced' },
  { value: 'external_link', label: 'External Link', category: 'advanced' },
  { value: 'point', label: 'Point (GIS)', category: 'gis' },
  { value: 'multipoint', label: 'Multi-Point (GIS)', category: 'gis' },
  { value: 'linestring', label: 'Line (GIS)', category: 'gis' },
  { value: 'multilinestring', label: 'Multi-Line (GIS)', category: 'gis' },
  { value: 'polygon', label: 'Polygon (GIS)', category: 'gis' },
  { value: 'multipolygon', label: 'Multi-Polygon (GIS)', category: 'gis' },
  { value: 'table', label: 'Sub-Table', category: 'layout' }
];

export const FIELD_CATEGORIES = {
  basic: 'Basic Fields',
  advanced: 'Advanced Fields',
  layout: 'Layout Elements',
  gis: 'Geographic Fields'
};
