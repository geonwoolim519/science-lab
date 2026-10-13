export function arrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - 9 * Math.cos(angle - 0.45), y2 - 9 * Math.sin(angle - 0.45))
  ctx.lineTo(x2 - 9 * Math.cos(angle + 0.45), y2 - 9 * Math.sin(angle + 0.45))
  ctx.closePath()
  ctx.fill()
}
