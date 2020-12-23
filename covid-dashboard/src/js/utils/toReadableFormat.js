export default function toReadableFormat(str) {
  return new Intl.NumberFormat('ru-RU').format(str);
}
