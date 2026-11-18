import { useId, useState } from 'react';

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <article className={`faq-item${open ? ' faq-item--open' : ''}`}>
    <h3 className="faq-question"><button type="button" id={`${id}-question`}
      aria-expanded={open} aria-controls={`${id}-answer`} onClick={() => setOpen(current => !current)}>
      <span>{question}</span><span className="faq-plus" aria-hidden="true">+</span>
    </button></h3>
    <div className="faq-answer" id={`${id}-answer`} role="region" aria-labelledby={`${id}-question`} aria-hidden={!open} inert={!open}>
      <div className="faq-answer-clip"><p>{answer}</p></div>
    </div>
  </article>;
}

export function FaqAccordion({ items }: { items: string[][] }) {
  return <div className="faq-list">{items.map(([question, answer]) => <FaqItem key={question} question={question} answer={answer} />)}</div>;
}
