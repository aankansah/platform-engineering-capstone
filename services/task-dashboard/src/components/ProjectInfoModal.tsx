import { StackShowcase } from './StackShowcase'

type ProjectInfoModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function ProjectInfoModal({ isOpen, onClose }: ProjectInfoModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:items-center"
      role="dialog"
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/50 bg-slate-100/90 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              Project Brief
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Capstone architecture
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              This platform demonstrates a production-style microservice
              pipeline: a React dashboard submits tasks, services validate and
              enrich them through Kafka, and the deployment layer covers cloud
              infrastructure, GitOps, security scanning, and observability.
            </p>
          </div>
          <button
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-semibold text-slate-700 shadow-lg shadow-slate-950/10 transition hover:bg-slate-950 hover:text-white"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>

        <StackShowcase />
      </div>
    </div>
  )
}
