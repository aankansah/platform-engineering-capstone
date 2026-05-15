import { useState } from 'react'
import heroImage from '../assets/hero.png'
import javaEmblem from '../assets/java-emblem.webp'
import kafkaEmblem from '../assets/kafka-emblem.webp'
import k8Emblem from '../assets/k8-emblem.png'
import reactLogo from '../assets/react.svg'
import rustEmblem from '../assets/rust-emblem.webp'
import tsIcon from '../assets/ts-icon.png'
import viteLogo from '../assets/vite.svg'

type StackItem = {
  name: string
  role: string
  image?: string
  initials?: string
}

type StackGroup = {
  title: string
  summary: string
  items: StackItem[]
}

const stackGroups: StackGroup[] = [
  {
    title: 'Frontend',
    summary: 'Dashboard experience and client-side task workflow.',
    items: [
      { name: 'React', role: 'Dashboard UI', image: reactLogo },
      { name: 'TypeScript', role: 'Typed frontend code', image: tsIcon },
      { name: 'Vite', role: 'Build tooling', image: viteLogo },
      { name: 'Tailwind CSS', role: 'Styling system', initials: 'TW' },
      { name: 'pnpm', role: 'Package manager', initials: 'PN' },
    ],
  },
  {
    title: 'Backend',
    summary: 'Polyglot services connected through Kafka events.',
    items: [
      { name: 'Node.js', role: 'API gateway service', initials: 'JS' },
      { name: 'TypeScript', role: 'API implementation', image: tsIcon },
      { name: 'Java 17', role: 'Task validation service', image: javaEmblem },
      { name: 'Spring Boot', role: 'Java service runtime', image: javaEmblem },
      { name: 'Rust', role: 'Task enrichment processor', image: rustEmblem },
      { name: 'Kafka', role: 'Tasks and events topics', image: kafkaEmblem },
      { name: 'PostgreSQL / RDS', role: 'Managed data layer', initials: 'DB' },
    ],
  },
  {
    title: 'Infrastructure',
    summary: 'AWS foundation, clusters, registries, networking, and charts.',
    items: [
      { name: 'AWS', role: 'Cloud platform', initials: 'AWS' },
      { name: 'Terraform', role: 'Infrastructure as Code', initials: 'TF' },
      { name: 'EKS', role: 'Kubernetes cluster', image: k8Emblem },
      { name: 'ECR', role: 'Container registry', initials: 'ECR' },
      { name: 'RDS', role: 'Managed database', initials: 'RDS' },
      { name: 'VPC', role: 'Networking module', initials: 'VPC' },
      { name: 'Helm', role: 'Kubernetes packaging', initials: 'HE' },
      { name: 'Docker', role: 'Container builds', initials: 'DK' },
    ],
  },
  {
    title: 'GitOps & Delivery',
    summary: 'Promotion flow from GitHub to Kubernetes environments.',
    items: [
      { name: 'GitHub Actions', role: 'CI/CD workflows', initials: 'GH' },
      { name: 'GitHub OIDC', role: 'AWS federated deploy auth', initials: 'OIDC' },
      { name: 'Argo CD', role: 'GitOps reconciliation', initials: 'ARGO' },
      { name: 'Helm Releases', role: 'Application deployment units', initials: 'HR' },
      { name: 'CODEOWNERS', role: 'Repository ownership', initials: 'CO' },
    ],
  },
  {
    title: 'Observability',
    summary: 'Operational visibility for services and Kubernetes runtime.',
    items: [
      { name: 'Monitoring Namespace', role: 'Cluster observability boundary', initials: 'MON' },
      { name: 'Dashboards', role: 'Service and platform views', initials: 'DBD' },
      { name: 'Kubernetes Events', role: 'Runtime diagnostics', image: k8Emblem },
      { name: 'k9s', role: 'Cluster terminal UI', initials: 'K9S' },
    ],
  },
  {
    title: 'Security',
    summary: 'Scanning and policy checks across containers, code, and IaC.',
    items: [
      { name: 'Trivy', role: 'Container vulnerability scanning', initials: 'TR' },
      { name: 'Gitleaks', role: 'Secrets scanning', initials: 'GL' },
      { name: 'tfsec', role: 'Terraform security checks', initials: 'TS' },
      { name: 'Checkov', role: 'Multi-framework IaC scanning', initials: 'CK' },
      { name: 'Network Policies', role: 'Namespace traffic controls', image: k8Emblem },
    ],
  },
  {
    title: 'Developer Tooling',
    summary: 'Local tools used to build, test, deploy, and inspect the system.',
    items: [
      { name: 'kubectl', role: 'Kubernetes CLI', image: k8Emblem },
      { name: 'AWS CLI', role: 'AWS operations', initials: 'AWS' },
      { name: 'Cargo', role: 'Rust builds and tests', image: rustEmblem },
      { name: 'OpenJDK 17', role: 'Java runtime', image: javaEmblem },
      { name: 'Node.js 20+', role: 'JavaScript runtime', initials: 'JS' },
    ],
  },
]

export function StackShowcase() {
  const [openGroup, setOpenGroup] = useState(stackGroups[0].title)

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/55 bg-white/55 p-5 shadow-2xl shadow-blue-950/10 backdrop-blur-2xl">
      <div className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-8 size-48 rounded-full bg-violet-300/30 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            Application Stack
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Platform layers
          </h2>
        </div>
        <img className="hidden size-14 object-contain sm:block" src={heroImage} alt="" />
      </div>

      <div className="relative mt-6 space-y-3">
        {stackGroups.map((group) => {
          const isOpen = group.title === openGroup

          return (
            <article
              className="overflow-hidden rounded-xl border border-white/70 bg-white/65 shadow-lg shadow-blue-900/5"
              key={group.title}
            >
              <button
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-white/70"
                onClick={() => setOpenGroup(isOpen ? '' : group.title)}
                type="button"
              >
                <span>
                  <span className="block text-sm font-semibold text-slate-950">
                    {group.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {group.summary}
                  </span>
                </span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-white/70 text-lg font-semibold text-blue-700">
                  {isOpen ? '-' : '+'}
                </span>
              </button>

              {isOpen && (
                <div className="grid gap-3 border-t border-white/70 p-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <StackTechnology item={item} key={`${group.title}-${item.name}`} />
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function StackTechnology({ item }: { item: StackItem }) {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-xl border border-white/70 bg-white/70 p-3">
      {item.image ? (
        <img
          className="size-10 shrink-0 object-contain"
          src={item.image}
          alt={`${item.name} emblem`}
        />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-bold text-blue-700">
          {item.initials}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-slate-950">
          {item.name}
        </h3>
        <p className="text-xs leading-5 text-slate-500">{item.role}</p>
      </div>
    </div>
  )
}
