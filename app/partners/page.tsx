import Link from "next/link";
import { PageFrame } from "@/components/site/PageFrame";
import { PageHero } from "@/components/site/PageHero";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Figure } from "@/components/site/Figure";
import { Schematic } from "@/components/site/Schematic";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Technology Partners",
  description:
    "The technology ecosystems Infeara works with across server, cloud, network, storage, security and monitoring platforms.",
  path: "/partners",
});

const ecosystems = [
  {
    title: "Server & identity",
    items: ["Windows Server", "Active Directory", "Linux (RHEL, Ubuntu, Debian)", "Microsoft 365", "Entra ID"],
  },
  {
    title: "Virtualisation & storage",
    items: ["Microsoft Hyper-V", "VMware", "Proxmox VE", "SAN and NAS platforms", "Object storage"],
  },
  {
    title: "Cloud",
    items: ["Microsoft Azure", "Amazon Web Services", "Google Cloud", "Hybrid and private cloud", "Colocation"],
  },
  {
    title: "Network & perimeter",
    items: ["Cisco", "Fortinet", "Sophos", "pfSense", "Structured cabling and wireless"],
  },
  {
    title: "Security & endpoint",
    items: ["Endpoint protection platforms", "Vulnerability scanning", "SIEM and log collection", "MFA and access control", "Email security"],
  },
  {
    title: "Backup & monitoring",
    items: ["Veeam", "Agent-based and agentless backup", "Off-site replication", "RMM and availability monitoring", "Ticketing and asset registers"],
  },
];

export default function PartnersPage() {
  return (
    <PageFrame>
      <PageHero
        eyebrow="Technology partners"
        title="Technology chosen for the estate, not the logo."
        intro="We work across the major server, cloud, network and security ecosystems. The platform is selected against the workload, the support position and the client's existing investment — not against a reseller incentive."
        crumbs={[{ label: "Technology partners", href: "/partners" }]}
        primary={{ label: "Talk to an expert", href: "/contact" }}
        secondary={{ label: "See our services", href: "/services" }}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Ecosystems"
            title="Platforms we work with."
            intro="This is a capability list, not a claim of partner status. Vendor names are used descriptively to indicate the technologies our engineers work with."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ecosystems.map((group) => (
              <div key={group.title} className="rounded-[var(--radius-card)] border border-navy/10 bg-white p-7">
                <h3 className="font-heading text-[1.02rem] font-semibold text-navy">{group.title}</h3>
                <ul className="mt-4 space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed text-charcoal/70">
                      <span aria-hidden="true" className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-blue/50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Selection"
              title="Four tests before a recommendation."
              intro="A platform decision is a commitment to a support position, a skillset and a cost profile. We apply the same tests whether the estate is on-premise, in cloud or both."
            />

            <ol className="mt-9 space-y-5">
              {[
                {
                  title: "Does it fit the workload?",
                  detail: "Performance, latency, data location and growth are checked against how the system is actually used.",
                },
                {
                  title: "Can it be supported?",
                  detail: "Vendor support, firmware cadence and the availability of engineers who know the platform matter more than a feature grid.",
                },
                {
                  title: "Can we recover it?",
                  detail: "Backup, restore and recovery time are designed before the platform is commissioned.",
                },
                {
                  title: "Does it respect the budget?",
                  detail: "Licensing and operating cost are modelled over the life of the platform, not just the purchase.",
                },
              ].map((item, index) => (
                <li key={item.title} className="flex gap-4 border-t border-navy/10 pt-5">
                  <span className="font-display text-sm text-blue">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-heading text-[0.98rem] font-semibold text-navy">{item.title}</h3>
                    <p className="mt-1.5 text-[0.9rem] leading-relaxed text-charcoal/70">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Schematic
            variant="layers"
            label="Platform stack"
            caption="A platform stack assessed as a whole: compute, virtualisation, storage, network and recovery, with support position at every layer."
          />
        </div>
      </section>

      <section className="bg-ivory py-20 md:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <Figure
            seed={101}
            label="Vendor landscape"
            caption="The vendor landscape reviewed against workload fit, supportability, recoverability and lifecycle cost."
          />
          <div>
            <SectionHeading
              eyebrow="Independence"
              title="No badges we cannot verify."
              intro="Partner status and certifications are commercial relationships, not proof of engineering quality. We display them only when they are current, verifiable and relevant to the work."
            />
            <div className="mt-7 space-y-4">
              {[
                "We do not display vendor badges we have not been awarded.",
                "We do not claim certification levels that are not current.",
                "We recommend the platform that fits, including where it is one we do not resell.",
                "We state when a requirement needs a specialist outside our practice.",
              ].map((item) => (
                <p key={item} className="border-l-2 border-coral/60 pl-4 text-[0.92rem] leading-relaxed text-charcoal/75">
                  {item}
                </p>
              ))}
            </div>
            <Link href="/about" className="link-arrow mt-8">
              More about Infeara <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Need a view on a platform decision?"
        body="We will compare the options against your workload, support position and recovery requirements, and state the trade-offs."
        primary={{ label: "Request a consultation", href: "/contact" }}
        secondary={{ label: "Read our approach", href: "/approach" }}
      />
    </PageFrame>
  );
}
