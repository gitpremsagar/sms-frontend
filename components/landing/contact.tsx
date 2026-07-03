import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { schoolContent } from "@/lib/school-content";

const contactItems = [
  {
    icon: MapPin,
    label: "Address",
    value: schoolContent.contact.address,
  },
  {
    icon: Phone,
    label: "Phone",
    value: schoolContent.contact.phone,
    href: `tel:${schoolContent.contact.phone.replace(/\s/g, "")}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: schoolContent.contact.email,
    href: `mailto:${schoolContent.contact.email}`,
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: schoolContent.contact.hours,
  },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Contact</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Get in touch with us
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Have questions about enrollment, programs, or school events? We&apos;d love to
            hear from you.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {contactItems.map((item) => (
            <div
              key={item.label}
              className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-1 block text-sm font-medium text-foreground hover:text-primary"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground sm:h-48 md:h-64">
          Map placeholder — add Google Maps embed here
        </div>
      </div>
    </section>
  );
}
