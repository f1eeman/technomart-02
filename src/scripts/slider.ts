const CURRENT = 'current'
const ACTIVE = 'active'

export function initSlider(): void {
  const slider = document.querySelector('[data-slider]')

  if (slider === null) return

  const slides = Array.from(
    slider.querySelectorAll<HTMLElement>('[data-slide]'),
  )
  const dots = Array.from(
    slider.querySelectorAll<HTMLElement>('[data-slide-to]'),
  )

  if (slides.length === 0 || dots.length === 0) return

  const show = (at: number): void => {
    slides.forEach((slide, index) => {
      slide.classList.toggle(CURRENT, index === at)
    })

    dots.forEach((dot, index) => {
      dot.classList.toggle(ACTIVE, index === at)
      dot.setAttribute('aria-pressed', index === at ? 'true' : 'false')
    })
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index)
    })
  })
}
