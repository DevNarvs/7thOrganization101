import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { mockDb } from "../services/mockSupabase";
import { generateOrganizationContent } from "../services/geminiService";
import {
  Announcement,
  Program,
  AboutContent,
  Organization,
  President,
  Registration,
  GalleryItem,
  Testimonial,
  ContactMessage,
  Officer,
} from "../types";
import { Button, TextField, Modal, ImageUpload } from "../components/UI";
import {
  Plus,
  Trash2,
  Sparkles,
  Save,
  Pencil,
  Search,
  Clock,
  Building2,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  RotateCcw,
  Users,
  LayoutDashboard,
  FileText,
  Image,
  MessageSquare,
  Inbox,
  Download,
  Megaphone,
  UserCheck,
  TrendingUp,
  Award,
  Briefcase,
  ChevronRight,
  Activity,
  Calendar,
  MapPin,
} from "lucide-react";

type Tab =
  | "overview"
  | "announcements"
  | "programs"
  | "about"
  | "organizations"
  | "presidents"
  | "gallery"
  | "testimonials"
  | "messages"
  | "officers";

const Admin: React.FC = () => {
  const { user } = useAuth();

  // Initialize based on role
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    return user?.role === "admin" ? "overview" : "programs";
  });

  // Data State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [presidents, setPresidents] = useState<President[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutContent[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);

  // New Features Data State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOrgId, setFilterOrgId] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // View State
  const [viewingItem, setViewingItem] = useState<any | null>(null);
  const [programRegistrations, setProgramRegistrations] = useState<
    Registration[]
  >([]);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<
    "Upcoming" | "Ongoing" | "Completed" | "Disapproved"
  >("Upcoming");
  const [formDate, setFormDate] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formAllowRegistration, setFormAllowRegistration] = useState(true);

  // Organization Specific Form State
  const [formOrgDetails, setFormOrgDetails] = useState({
    fullDescription: "",
    mission: "",
    vision: "",
    presidentName: "",
    presidentId: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    password: "",
  });

  // President Specific Form State
  const [formPresident, setFormPresident] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "Active" as "Active" | "Inactive",
  });

  // Officer Specific Form State
  const [formOfficer, setFormOfficer] = useState({
    name: "",
    position: "",
    bio: "",
    imageUrl: "",
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    fetchData();
    // If on overview, fetch everything for stats
    if (activeTab === "overview") {
      setIsLoadingStats(true);
      Promise.all([
        mockDb.programs.getAll().then(setPrograms),
        mockDb.organizations.getAll().then(setOrganizations),
        mockDb.registrations.getAll().then(setAllRegistrations),
        mockDb.presidents.getAll().then(setPresidents),
        mockDb.testimonials.getAll().then(setTestimonials),
        mockDb.messages.getAll().then(setMessages),
        mockDb.gallery.getAll().then(setGalleryItems),
        mockDb.officers.getAll().then(setOfficers),
      ]).finally(() => setIsLoadingStats(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Fetch registrations when viewing a program
  useEffect(() => {
    if (viewingItem && activeTab === "programs") {
      setIsLoadingRegs(true);
      mockDb.registrations
        .getByProgramId(viewingItem.id)
        .then(setProgramRegistrations)
        .finally(() => setIsLoadingRegs(false));
    } else {
      setProgramRegistrations([]);
    }
  }, [viewingItem, activeTab]);

  const fetchData = async () => {
    switch (activeTab) {
      case "announcements":
        setAnnouncements(await mockDb.announcements.getAll());
        break;
      case "programs":
        setPrograms(await mockDb.programs.getAll());
        break;
      case "about":
        setAboutSections(await mockDb.about.getAll());
        break;
      case "organizations":
        setOrganizations(await mockDb.organizations.getAll());
        break;
      case "presidents":
        setPresidents(await mockDb.presidents.getAll());
        break;
      case "gallery":
        setGalleryItems(await mockDb.gallery.getAll());
        break;
      case "testimonials":
        setTestimonials(await mockDb.testimonials.getAll());
        break;
      case "messages":
        setMessages(await mockDb.messages.getAll());
        break;
      case "officers":
        setOfficers(await mockDb.officers.getAll());
        break;
    }
  };

  // Permission Helper
  const canEdit = (organizerId?: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role === "president") {
      if (activeTab === "programs") return organizerId === user.organizationId;
      if (activeTab === "organizations")
        return organizerId === user.organizationId;
      return false;
    }
    return false;
  };

  // Filter Logic
  const getFilteredItems = () => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (text: string) =>
      text.toLowerCase().includes(searchLower);

    const matchesOrg = (orgId?: string) => {
      if (user?.role === "president") {
        return orgId === user.organizationId;
      }
      if (!filterOrgId) return true;
      return orgId === filterOrgId;
    };

    const matchesPending = (item: any) => {
      if (activeTab === "programs" && showPendingOnly) {
        return item.isApproved === false && item.status !== "Disapproved";
      }
      return true;
    };

    switch (activeTab) {
      case "announcements":
        return announcements.filter(
          (a) => matchesSearch(a.title) || matchesSearch(a.content)
        );
      case "programs":
        return programs.filter(
          (p) =>
            (matchesSearch(p.title) || matchesSearch(p.description)) &&
            matchesOrg(p.organizerId) &&
            matchesPending(p)
        );
      case "organizations":
        return organizations.filter(
          (o) => matchesSearch(o.name) || matchesSearch(o.presidentName)
        );
      case "presidents":
        return presidents.filter(
          (p) =>
            matchesSearch(p.firstName) ||
            matchesSearch(p.lastName) ||
            matchesSearch(p.email)
        );
      case "gallery":
        return galleryItems.filter((i) => matchesSearch(i.title));
      case "testimonials":
        return testimonials.filter(
          (t) => matchesSearch(t.authorName) || matchesSearch(t.content)
        );
      case "messages":
        return messages.filter(
          (m) => matchesSearch(m.subject) || matchesSearch(m.email)
        );
      case "officers":
        return officers.filter(
          (o) => matchesSearch(o.name) || matchesSearch(o.position)
        );
      default:
        return [];
    }
  };

  const handleAddItem = () => {
    setEditingId(null);
    setFormTitle("");
    setFormContent("");
    setFormImageUrl("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStatus("Upcoming");
    setFormLocation("");
    setFormAllowRegistration(true);
    setFormOrgDetails({
      fullDescription: "",
      mission: "",
      vision: "",
      presidentName: "",
      presidentId: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      password: "",
    });
    setFormPresident({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      status: "Active",
    });
    setFormOfficer({ name: "", position: "", bio: "", imageUrl: "" });
    setAiPrompt("");
    setIsModalOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingId(item.id);
    setAiPrompt("");

    if (activeTab === "organizations") {
      setFormTitle(item.name);
      setFormContent(item.shortDescription);
      setFormImageUrl(item.logoUrl || "");
      setFormOrgDetails({
        fullDescription: item.fullDescription,
        mission: item.mission || "",
        vision: item.vision || "",
        presidentName: item.presidentName,
        presidentId: item.presidentId || "",
        contactEmail: item.contactEmail,
        contactPhone: item.contactPhone,
        website: item.website || "",
        password: item.password || "",
      });
    } else if (activeTab === "presidents") {
      setFormPresident({
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        phone: item.phone,
        status: item.status,
      });
    } else if (activeTab === "officers") {
      setFormOfficer({
        name: item.name,
        position: item.position,
        bio: item.bio,
        imageUrl: item.imageUrl || "",
      });
      setFormImageUrl(item.imageUrl || ""); // Use shared image state for upload preview
    } else if (activeTab === "gallery") {
      setFormTitle(item.title);
      setFormImageUrl(item.imageUrl);
    } else if (activeTab === "about") {
      setFormTitle(item.sectionTitle);
      setFormContent(item.content);
    } else {
      setFormTitle(item.title);
      setFormContent(
        activeTab === "programs" ? item.description : item.content
      );
      setFormImageUrl(item.imageUrl || "");
      if (activeTab === "programs") {
        setFormDate(item.date ? item.date.split("T")[0] : "");
        setFormStatus(item.status || "Upcoming");
        setFormLocation(item.location || "");
        setFormAllowRegistration(item.allowRegistration !== false);
      } else if (activeTab === "announcements") {
        setFormDate(item.date ? item.date.split("T")[0] : "");
      }
    }

    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (activeTab === "announcements") {
      const data = {
        title: formTitle,
        content: formContent,
        date: formDate || new Date().toISOString(),
        imageUrl: formImageUrl || undefined,
      };
      if (editingId)
        await mockDb.announcements.update({
          ...data,
          id: editingId,
        } as Announcement);
      else await mockDb.announcements.add(data);
    } else if (activeTab === "programs") {
      const isApproved = user?.role === "admin";
      const data = {
        title: formTitle,
        description: formContent,
        date: formDate || new Date().toISOString(),
        status: formStatus,
        location: formLocation || "TBD",
        imageUrl: formImageUrl || undefined,
        organizerId: user?.organizationId,
        isApproved: isApproved,
        allowRegistration: formAllowRegistration,
      };
      if (editingId) {
        const original = programs.find((p) => p.id === editingId);
        await mockDb.programs.update({
          ...data,
          id: editingId,
          organizerId: original?.organizerId || user?.organizationId,
          isApproved: original?.isApproved,
        } as Program);
      } else {
        await mockDb.programs.add(data);
      }
    } else if (activeTab === "organizations") {
      const data = {
        name: formTitle,
        shortDescription: formContent,
        logoUrl: formImageUrl || "",
        ...formOrgDetails,
      };
      if (editingId)
        await mockDb.organizations.update({
          ...data,
          id: editingId,
        } as Organization);
      else await mockDb.organizations.add(data);
    } else if (activeTab === "presidents") {
      const data = { ...formPresident };
      if (editingId)
        await mockDb.presidents.update({ ...data, id: editingId } as President);
      else await mockDb.presidents.add(data);
    } else if (activeTab === "gallery") {
      const data = {
        title: formTitle,
        imageUrl: formImageUrl,
        dateUploaded: new Date().toISOString(),
      };
      if (editingId) {
        /* Gallery update not implemented in mockDb but easy to add, for now assume add only or delete */
      } else await mockDb.gallery.add(data);
    } else if (activeTab === "officers") {
      const data = {
        name: formOfficer.name,
        position: formOfficer.position,
        bio: formOfficer.bio,
        imageUrl: formImageUrl || "",
        order: officers.length + 1,
      };
      if (editingId)
        await mockDb.officers.update({ ...data, id: editingId } as Officer);
      else await mockDb.officers.add(data);
    } else if (activeTab === "about") {
      const updatedSections = aboutSections.map((s) =>
        s.id === editingId
          ? { ...s, sectionTitle: formTitle, content: formContent }
          : s
      );
      await mockDb.about.update(updatedSections);
    }

    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    if (activeTab === "announcements") await mockDb.announcements.delete(id);
    if (activeTab === "programs") await mockDb.programs.delete(id);
    if (activeTab === "organizations") await mockDb.organizations.delete(id);
    if (activeTab === "presidents") await mockDb.presidents.delete(id);
    if (activeTab === "gallery") await mockDb.gallery.delete(id);
    if (activeTab === "testimonials") await mockDb.testimonials.delete(id);
    if (activeTab === "officers") await mockDb.officers.delete(id);
    fetchData();
  };

  const handleApprove = async (item: Program) => {
    const newStatus =
      item.status === "Disapproved" || !item.status ? "Upcoming" : item.status;
    await mockDb.programs.update({
      ...item,
      isApproved: true,
      status: newStatus,
    });
    setViewingItem(null);
    fetchData();
  };

  const handleDisapprove = async (item: Program) => {
    await mockDb.programs.update({
      ...item,
      isApproved: false,
      status: "Disapproved",
    });
    setViewingItem(null);
    fetchData();
  };

  const handleTestimonialStatus = async (
    id: string,
    status: "Approved" | "Rejected"
  ) => {
    await mockDb.testimonials.updateStatus(id, status);
    fetchData();
    if (viewingItem) setViewingItem(null);
  };

  const handleMarkMessageRead = async (id: string) => {
    await mockDb.messages.markAsRead(id);
    fetchData();
    if (viewingItem) setViewingItem(null);
  };

  const handleGenerateAI = async (type: "announcement" | "about") => {
    if (!formTitle) {
      alert("Please enter a title first to guide the AI.");
      return;
    }
    setIsGeneratingAI(true);
    const content = await generateOrganizationContent(formTitle, type);
    setFormContent(content);
    setIsGeneratingAI(false);
  };

  const handlePresidentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const pres = presidents.find((p) => p.id === selectedId);
    if (pres) {
      setFormOrgDetails((prev) => ({
        ...prev,
        presidentId: pres.id,
        presidentName: `${pres.firstName} ${pres.lastName}`,
        contactEmail: pres.email,
        contactPhone: pres.phone,
      }));
    } else {
      setFormOrgDetails((prev) => ({
        ...prev,
        presidentId: "",
        presidentName: "",
        contactEmail: "",
        contactPhone: "",
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Ongoing":
        return "bg-blue-100 text-blue-800";
      case "Disapproved":
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Read":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  const getOrgName = (id?: string) =>
    organizations.find((o) => o.id === id)?.name || "Unknown";

  // --- MODERN UI COMPONENTS ---

  // 1. Nav Button Grid (Pink Box Area)
  const NavActionGrid = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
        Dashboard Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "announcements", label: "Announcements", icon: Megaphone },
          { id: "programs", label: "Programs", icon: Calendar },
          { id: "organizations", label: "Organizations", icon: Building2 },
          { id: "presidents", label: "Presidents", icon: UserCheck },
          { id: "officers", label: "Officers", icon: Briefcase },
          { id: "gallery", label: "Gallery", icon: Image },
          {
            id: "testimonials",
            label: "Testimonials",
            icon: MessageSquare,
            count: testimonials.filter((t) => t.status === "Pending").length,
          },
          {
            id: "messages",
            label: "Messages",
            icon: Inbox,
            count: messages.filter((m) => m.status === "New").length,
          },
          { id: "about", label: "About Page", icon: FileText },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={`
              relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300
              ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 transform -translate-y-1"
                  : "bg-white text-gray-600 border border-gray-100 hover:border-blue-300 hover:shadow-md hover:-translate-y-1"
              }
            `}
          >
            <div
              className={`p-2 rounded-full mb-2 transition-colors ${
                activeTab === item.id
                  ? "bg-white/20"
                  : "bg-gray-50 group-hover:bg-blue-50"
              }`}
            >
              <item.icon
                size={24}
                className={
                  activeTab === item.id ? "text-white" : "text-blue-600"
                }
              />
            </div>
            <span className="text-sm font-semibold tracking-wide">
              {item.label}
            </span>

            {item.count !== undefined && item.count > 0 && (
              <span
                className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                  activeTab === item.id
                    ? "bg-white text-blue-600"
                    : "bg-red-500 text-white"
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // 2. Dark Analytics Card (Black Box Area)
  const DarkAnalyticsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    accentColor,
  }: any) => (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 relative overflow-hidden group hover:border-slate-600 transition-colors">
      {/* Background glow effect */}
      <div
        className={`absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-${accentColor}-500 w-32 h-32 rounded-full blur-2xl`}
      ></div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
          <div className="flex items-center text-xs text-slate-400">
            {subtitle && (
              <span
                className={`flex items-center gap-1 ${
                  subtitle.includes("+") ? "text-green-400" : "text-slate-500"
                }`}
              >
                {subtitle.includes("+") && <TrendingUp size={12} />}
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div
          className={`p-3 rounded-lg bg-slate-700/50 text-${accentColor}-400`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  const DarkAnalyticsSection = () => (
    <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl mb-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">System Analytics</h2>
            <p className="text-slate-400 text-sm">Real-time data overview</p>
          </div>
        </div>
        <Button
          variant="outlined"
          className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DarkAnalyticsCard
          title="Total Programs"
          value={programs.length}
          subtitle="+2 this month"
          icon={Calendar}
          accentColor="blue"
        />
        <DarkAnalyticsCard
          title="Pending Approvals"
          value={
            programs.filter((p) => !p.isApproved && p.status !== "Disapproved")
              .length
          }
          subtitle="Requires Action"
          icon={Clock}
          accentColor="yellow"
        />
        <DarkAnalyticsCard
          title="Active Officers"
          value={officers.length}
          subtitle="Leadership Team"
          icon={Award}
          accentColor="green"
        />
        <DarkAnalyticsCard
          title="Website Visits"
          value="24.5k"
          subtitle="+12% vs last month"
          icon={TrendingUp}
          accentColor="cyan"
        />
        <DarkAnalyticsCard
          title="Testimonials"
          value={testimonials.length}
          subtitle={`${
            testimonials.filter((t) => t.status === "Approved").length
          } Approved / ${
            testimonials.filter((t) => t.status === "Pending").length
          } Pending`}
          icon={MessageSquare}
          accentColor="pink"
        />
        <DarkAnalyticsCard
          title="Photo Gallery"
          value={galleryItems.length}
          subtitle="Total Uploads"
          icon={Image}
          accentColor="purple"
        />
      </div>
    </div>
  );

  const renderViewModalContent = () => {
    if (!viewingItem) return null;

    if (activeTab === "messages") {
      const item = viewingItem as ContactMessage;
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">{item.subject}</h3>
            <span
              className={`text-xs px-2 py-1 rounded font-bold uppercase ${getStatusColor(
                item.status
              )}`}
            >
              {item.status}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded border border-gray-100 space-y-2">
            <p>
              <span className="font-bold text-gray-500 text-xs uppercase">
                From:
              </span>{" "}
              {item.name} ({item.email})
            </p>
            <p>
              <span className="font-bold text-gray-500 text-xs uppercase">
                Sent:
              </span>{" "}
              {new Date(item.dateSent).toLocaleString()}
            </p>
          </div>
          <div className="p-4 border rounded bg-white">
            <p className="whitespace-pre-wrap text-gray-800">{item.message}</p>
          </div>
          {item.status === "New" && (
            <div className="flex justify-end">
              <Button onClick={() => handleMarkMessageRead(item.id)} size="sm">
                <CheckCircle size={16} className="mr-2" /> Mark as Read
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "testimonials") {
      const item = viewingItem as Testimonial;
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xl">
                {item.authorName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{item.authorName}</h3>
                <p className="text-sm text-gray-500">{item.role}</p>
              </div>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded font-bold uppercase ${getStatusColor(
                item.status
              )}`}
            >
              {item.status}
            </span>
          </div>
          <div className="bg-gray-50 p-6 rounded border border-gray-100 italic text-gray-700 text-lg relative">
            <span className="text-4xl text-gray-300 absolute top-2 left-2">
              "
            </span>
            {item.content}
          </div>
          {item.status === "Pending" && (
            <div className="flex gap-4 justify-end border-t pt-4">
              <Button
                variant="contained"
                onClick={() => handleTestimonialStatus(item.id, "Approved")}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle size={16} className="mr-2" /> Approve
              </Button>
              <Button
                variant="contained"
                color="danger"
                onClick={() => handleTestimonialStatus(item.id, "Rejected")}
                size="sm"
              >
                <XCircle size={16} className="mr-2" /> Reject
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "presidents") {
      const item = viewingItem as President;
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={32} className="text-gray-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {item.firstName} {item.lastName}
              </h2>
              <span
                className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                  item.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
          <div className="grid gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-gray-500" />
              <span className="text-gray-900">{item.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-gray-500" />
              <span className="text-gray-900">{item.phone}</span>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "organizations") {
      const item = viewingItem as Organization;
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            {item.logoUrl ? (
              <img
                src={item.logoUrl}
                alt={item.name}
                className="w-20 h-20 rounded-full object-cover border shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                No Logo
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
              <p className="text-gray-500">{item.shortDescription}</p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase">About</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {item.fullDescription}
            </p>
          </div>
          {(item.mission || item.vision) && (
            <div className="grid gap-4">
              {item.mission && (
                <div className="bg-blue-50 p-3 rounded border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 uppercase">
                    Mission
                  </p>
                  <p className="text-gray-800 italic">"{item.mission}"</p>
                </div>
              )}
              {item.vision && (
                <div className="bg-purple-50 p-3 rounded border border-purple-100">
                  <p className="text-xs font-bold text-purple-700 uppercase">
                    Vision
                  </p>
                  <p className="text-gray-800 italic">"{item.vision}"</p>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">
                President
              </p>
              <p className="text-gray-900 font-medium">{item.presidentName}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Email</p>
              <p className="text-gray-900">{item.contactEmail}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Phone</p>
              <p className="text-gray-900">{item.contactPhone}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">
                Website
              </p>
              <p className="text-blue-600 truncate">{item.website || "N/A"}</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "announcements") {
      const item = viewingItem as Announcement;
      return (
        <div className="space-y-6">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              className="w-full h-64 object-cover rounded-lg"
              alt={item.title}
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
            <p className="text-gray-600 mt-1">
              {new Date(item.date).toLocaleDateString()}
            </p>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {item.content}
          </p>
        </div>
      );
    }

    if (activeTab === "programs") {
      const item = viewingItem as Program;
      const isPending = !item.isApproved && item.status !== "Disapproved";
      return (
        <div className="space-y-6">
          {/* Status and Header */}
          {isPending && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-yellow-800">
                    Pending Admin Approval
                  </p>
                  <p className="text-sm text-yellow-700">
                    This program is not yet visible to the public.
                  </p>
                </div>
                {user?.role === "admin" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(item)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle size={16} className="mr-1" /> Approve Request
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      onClick={() => handleDisapprove(item)}
                    >
                      <XCircle size={16} className="mr-1" /> Disapprove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          {item.status === "Disapproved" && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-red-800">Disapproved</p>
                <p className="text-sm text-red-700">
                  This program was rejected by an admin.
                </p>
              </div>
              {user?.role === "admin" && (
                <Button size="sm" onClick={() => handleApprove(item)}>
                  <RotateCcw size={16} className="mr-1" /> Re-Approve
                </Button>
              )}
            </div>
          )}

          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}

          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status}
              </span>
            </div>
            <div className="flex items-center text-blue-600 font-bold mt-2">
              <Building2 size={18} className="mr-2" />{" "}
              {getOrgName(item.organizerId)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Date</p>
              <div className="flex items-center mt-1 text-gray-900 font-medium">
                <Calendar size={16} className="mr-2 text-blue-500" />{" "}
                {new Date(item.date).toLocaleDateString()}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">
                Location
              </p>
              <div className="flex items-center mt-1 text-gray-900 font-medium">
                <MapPin size={16} className="mr-2 text-red-500" />{" "}
                {item.location}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-800 uppercase mb-2">
              Description
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          {/* Registration List Section */}
          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-800 flex items-center">
                <Users size={20} className="mr-2" /> Registered Participants (
                {programRegistrations.length})
              </h4>
              <Button size="sm" variant="outlined" disabled>
                <Download size={16} className="mr-2" /> Export CSV
              </Button>
            </div>

            {isLoadingRegs ? (
              <p>Loading participants...</p>
            ) : (
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase font-bold text-xs">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Status</th>
                      {/* Action column for approvals */}
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {programRegistrations.length > 0 ? (
                      programRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">
                            {reg.participantName}
                          </td>
                          <td className="p-3 text-gray-600">
                            {reg.participantEmail}
                          </td>
                          <td className="p-3 text-gray-500">
                            {reg.phone && <div>Phone: {reg.phone}</div>}
                            {reg.age && <div>Age: {reg.age}</div>}
                            {reg.affiliation && (
                              <div>Org: {reg.affiliation}</div>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs px-2 py-1 rounded font-bold ${getStatusColor(
                                reg.status
                              )}`}
                            >
                              {reg.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {reg.status === "Pending" && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    mockDb.registrations
                                      .update({ ...reg, status: "Approved" })
                                      .then(() => {
                                        // Refresh local list
                                        setProgramRegistrations((prev) =>
                                          prev.map((r) =>
                                            r.id === reg.id
                                              ? { ...r, status: "Approved" }
                                              : r
                                          )
                                        );
                                      });
                                  }}
                                  className="text-green-600 hover:bg-green-50 p-1 rounded"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    mockDb.registrations
                                      .update({ ...reg, status: "Rejected" })
                                      .then(() => {
                                        setProgramRegistrations((prev) =>
                                          prev.map((r) =>
                                            r.id === reg.id
                                              ? { ...r, status: "Rejected" }
                                              : r
                                          )
                                        );
                                      });
                                  }}
                                  className="text-red-600 hover:bg-red-50 p-1 rounded"
                                  title="Reject"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-6 text-center text-gray-500"
                        >
                          No registrations yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "about") {
      const item = viewingItem as AboutContent;
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {item.sectionTitle}
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard{" "}
          <span className="text-lg font-normal text-gray-500">
            | Welcome, {user?.name}
          </span>
        </h1>
        <p className="text-gray-500 mb-6">
          Manage your organization's content and overview performance.
        </p>

        {/* PINK BOX AREA: Modern Grid Navigation */}
        {user?.role === "admin" && <NavActionGrid />}
      </div>

      {/* BLACK BOX AREA: Dark Themed Analytics */}
      {activeTab === "overview" && user?.role === "admin" && (
        <DarkAnalyticsSection />
      )}

      {activeTab !== "overview" && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 mt-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold capitalize flex-shrink-0 text-black flex items-center gap-2">
              Manage {activeTab}{" "}
              <ChevronRight size={16} className="text-gray-400" />
            </h2>

            {/* Search and Filters */}
            {(activeTab === "programs" ||
              activeTab === "organizations" ||
              activeTab === "presidents" ||
              activeTab === "announcements" ||
              activeTab === "gallery" ||
              activeTab === "testimonials" ||
              activeTab === "messages" ||
              activeTab === "officers") && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-grow md:w-64">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400 transition-shadow hover:shadow-sm"
                  />
                </div>

                {activeTab === "programs" && user?.role === "admin" && (
                  <>
                    <select
                      aria-label="Filter by organization"
                      value={filterOrgId}
                      onChange={(e) => setFilterOrgId(e.target.value)}
                      className="border border-gray-300 rounded text-sm py-2 px-2 focus:outline-none bg-white text-gray-900"
                    >
                      <option value="">All Orgs</option>
                      {organizations.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant={showPendingOnly ? "contained" : "outlined"}
                      size="sm"
                      onClick={() => setShowPendingOnly(!showPendingOnly)}
                    >
                      <Clock size={16} className="mr-1" /> Pending
                    </Button>
                  </>
                )}
              </div>
            )}

            {activeTab !== "about" &&
              activeTab !== "messages" &&
              activeTab !== "testimonials" && (
                <div className="flex justify-end w-full md:w-auto">
                  <Button
                    onClick={handleAddItem}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus size={18} className="mr-2" /> Add New
                  </Button>
                </div>
              )}
          </div>

          {/* GENERIC LIST RENDERER */}
          <div className="space-y-4">
            {/* GALLERY */}
            {activeTab === "gallery" &&
              galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 border rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleEditItem(item)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      alt={item.title}
                    />
                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                  </div>
                  <Button
                    variant="text"
                    color="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}

            {/* OFFICERS */}
            {activeTab === "officers" &&
              officers.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 border rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleEditItem(item)}
                >
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                        alt={item.name}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.position}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="text"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem(item);
                      }}
                    >
                      <Pencil size={18} />
                    </Button>
                    <Button
                      variant="text"
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}

            {/* TESTIMONIALS */}
            {activeTab === "testimonials" &&
              testimonials.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 border rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setViewingItem(item)}
                >
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {item.authorName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {item.role} •{" "}
                      {new Date(item.dateSubmitted).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs px-2 py-1 rounded font-bold uppercase ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                    <Button
                      variant="text"
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}

            {/* MESSAGES */}
            {activeTab === "messages" &&
              messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer hover:bg-blue-50 transition-colors ${
                    item.status === "New" ? "bg-blue-50 border-blue-200" : ""
                  }`}
                  onClick={() => setViewingItem(item)}
                >
                  <div>
                    <h3
                      className={`text-gray-800 ${
                        item.status === "New" ? "font-bold" : ""
                      }`}
                    >
                      {item.subject}
                    </h3>
                    <p className="text-xs text-gray-500">
                      From: {item.name} •{" "}
                      {new Date(item.dateSent).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.status === "New" && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded font-bold uppercase ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}

            {/* ANNOUNCEMENTS */}
            {activeTab === "announcements" &&
              getFilteredItems().map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 border rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setViewingItem(item)}
                >
                  <div>
                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  {user?.role === "admin" && (
                    <div className="flex gap-2">
                      <Button
                        variant="text"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(item);
                        }}
                      >
                        <Pencil size={18} />
                      </Button>
                      <Button
                        variant="text"
                        color="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

            {/* PROGRAMS */}
            {activeTab === "programs" &&
              getFilteredItems().map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 border rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setViewingItem(item)}
                >
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        alt={item.title}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <FileText className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <span
                          className={`px-2 py-0.5 rounded font-bold uppercase ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                        {!item.isApproved && item.status !== "Disapproved" && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold flex items-center">
                            <Clock size={10} className="mr-1" /> Pending
                          </span>
                        )}
                        <span className="text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canEdit(item.organizerId) && (
                    <div className="flex gap-2">
                      <Button
                        variant="text"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(item);
                        }}
                      >
                        <Pencil size={18} />
                      </Button>
                      <Button
                        variant="text"
                        color="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

            {/* ORGANIZATIONS */}
            {activeTab === "organizations" &&
              getFilteredItems().map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 border rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setViewingItem(item)}
                >
                  <div className="flex items-center gap-4">
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        className="w-12 h-12 rounded-full object-cover border shadow-sm"
                        alt={item.name}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-xs text-gray-500">
                        {item.presidentName}
                      </p>
                    </div>
                  </div>
                  {user?.role === "admin" && (
                    <div className="flex gap-2">
                      <Button
                        variant="text"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(item);
                        }}
                      >
                        <Pencil size={18} />
                      </Button>
                      <Button
                        variant="text"
                        color="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

            {/* PRESIDENTS */}
            {activeTab === "presidents" &&
              getFilteredItems().map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 border rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setViewingItem(item)}
                >
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {item.firstName} {item.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">{item.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                        item.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                    {user?.role === "admin" && (
                      <div className="flex gap-2">
                        <Button
                          variant="text"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditItem(item);
                          }}
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button
                          variant="text"
                          color="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {/* ABOUT */}
            {activeTab === "about" &&
              aboutSections.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 border rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setViewingItem(item)}
                >
                  <h3 className="font-bold text-gray-800">
                    {item.sectionTitle}
                  </h3>
                  {user?.role === "admin" && (
                    <Button
                      variant="text"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem(item);
                      }}
                    >
                      <Pencil size={18} /> Edit
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Manage Item"
      >
        <div className="space-y-4">
          {activeTab === "gallery" && (
            <>
              <TextField
                label="Title / Caption"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
              <ImageUpload
                label="Photo"
                value={formImageUrl}
                onChange={setFormImageUrl}
              />
            </>
          )}
          {activeTab === "officers" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Name"
                  value={formOfficer.name}
                  onChange={(e) =>
                    setFormOfficer({ ...formOfficer, name: e.target.value })
                  }
                />
                <TextField
                  label="Position"
                  value={formOfficer.position}
                  onChange={(e) =>
                    setFormOfficer({ ...formOfficer, position: e.target.value })
                  }
                />
              </div>
              <ImageUpload
                label="Profile Photo"
                value={formImageUrl}
                onChange={setFormImageUrl}
              />
              <TextField
                label="Bio"
                multiline
                value={formOfficer.bio}
                onChange={(e) =>
                  setFormOfficer({ ...formOfficer, bio: e.target.value })
                }
              />
            </>
          )}

          {activeTab === "announcements" && (
            <>
              <TextField
                label="Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
              <TextField
                label="Date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
              <ImageUpload
                label="Image"
                value={formImageUrl}
                onChange={setFormImageUrl}
              />
              <TextField
                label="Content"
                multiline
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
              <div className="flex justify-end mb-2">
                <Button
                  type="button"
                  variant="text"
                  size="sm"
                  onClick={() => handleGenerateAI("announcement")}
                  disabled={isGeneratingAI}
                >
                  <Sparkles size={16} className="mr-2" />{" "}
                  {isGeneratingAI ? "Generating..." : "Auto-Generate Content"}
                </Button>
              </div>
            </>
          )}

          {activeTab === "programs" && (
            <>
              <TextField
                label="Program Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
                <div className="mb-4">
                  <label
                    htmlFor="programStatus"
                    className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider"
                  >
                    Status
                  </label>
                  <select
                    id="programStatus"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <TextField
                label="Location"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
              />
              <ImageUpload
                label="Cover Image"
                value={formImageUrl}
                onChange={setFormImageUrl}
              />
              <TextField
                label="Description"
                multiline
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="allowReg"
                  checked={formAllowRegistration}
                  onChange={(e) => setFormAllowRegistration(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="allowReg"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Allow Event Registration
                </label>
              </div>
            </>
          )}

          {activeTab === "organizations" && (
            <>
              <TextField
                label="Organization Name"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
              <TextField
                label="Short Description"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
              <ImageUpload
                label="Logo"
                value={formImageUrl}
                onChange={setFormImageUrl}
              />

              <div className="mb-4">
                <label
                  htmlFor="presidentSelect"
                  className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider"
                >
                  Assign President
                </label>
                <select
                  id="presidentSelect"
                  value={formOrgDetails.presidentId}
                  onChange={handlePresidentSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="">-- Select Active President --</option>
                  {presidents
                    .filter((p) => p.status === "Active")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="President Name"
                  value={formOrgDetails.presidentName}
                  onChange={(e) =>
                    setFormOrgDetails({
                      ...formOrgDetails,
                      presidentName: e.target.value,
                    })
                  }
                  disabled
                />
                <TextField
                  label="Phone"
                  value={formOrgDetails.contactPhone}
                  onChange={(e) =>
                    setFormOrgDetails({
                      ...formOrgDetails,
                      contactPhone: e.target.value,
                    })
                  }
                />
              </div>
              <TextField
                label="Email"
                value={formOrgDetails.contactEmail}
                onChange={(e) =>
                  setFormOrgDetails({
                    ...formOrgDetails,
                    contactEmail: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-500 mb-4 -mt-3">
                * This email will be used for the President's login.
              </p>

              <TextField
                label="Password"
                type="password"
                value={formOrgDetails.password}
                onChange={(e) =>
                  setFormOrgDetails({
                    ...formOrgDetails,
                    password: e.target.value,
                  })
                }
                placeholder="Set login password"
              />

              <TextField
                label="Website"
                value={formOrgDetails.website}
                onChange={(e) =>
                  setFormOrgDetails({
                    ...formOrgDetails,
                    website: e.target.value,
                  })
                }
              />

              <TextField
                label="Mission Statement"
                multiline
                value={formOrgDetails.mission}
                onChange={(e) =>
                  setFormOrgDetails({
                    ...formOrgDetails,
                    mission: e.target.value,
                  })
                }
              />
              <TextField
                label="Vision Statement"
                multiline
                value={formOrgDetails.vision}
                onChange={(e) =>
                  setFormOrgDetails({
                    ...formOrgDetails,
                    vision: e.target.value,
                  })
                }
              />
              <TextField
                label="Full Description / About"
                multiline
                value={formOrgDetails.fullDescription}
                onChange={(e) =>
                  setFormOrgDetails({
                    ...formOrgDetails,
                    fullDescription: e.target.value,
                  })
                }
              />
            </>
          )}

          {activeTab === "presidents" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="First Name"
                  value={formPresident.firstName}
                  onChange={(e) =>
                    setFormPresident({
                      ...formPresident,
                      firstName: e.target.value,
                    })
                  }
                />
                <TextField
                  label="Last Name"
                  value={formPresident.lastName}
                  onChange={(e) =>
                    setFormPresident({
                      ...formPresident,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
              <TextField
                label="Email"
                value={formPresident.email}
                onChange={(e) =>
                  setFormPresident({ ...formPresident, email: e.target.value })
                }
              />
              <TextField
                label="Phone"
                value={formPresident.phone}
                onChange={(e) =>
                  setFormPresident({ ...formPresident, phone: e.target.value })
                }
              />
              <div className="mb-4">
                <label
                  htmlFor="presidentStatus"
                  className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider"
                >
                  Status
                </label>
                <select
                  id="presidentStatus"
                  value={formPresident.status}
                  onChange={(e) =>
                    setFormPresident({
                      ...formPresident,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </>
          )}

          {activeTab === "about" && (
            <>
              <TextField
                label="Section Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
              <TextField
                label="Content"
                multiline
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
              <div className="flex justify-end mb-2">
                <Button
                  type="button"
                  variant="text"
                  size="sm"
                  onClick={() => handleGenerateAI("about")}
                  disabled={isGeneratingAI}
                >
                  <Sparkles size={16} className="mr-2" />{" "}
                  {isGeneratingAI ? "Generating..." : "Auto-Generate Content"}
                </Button>
              </div>
            </>
          )}

          <Button fullWidth onClick={handleSave}>
            <Save size={18} className="mr-2" /> Save
          </Button>
        </div>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        title="View Details"
      >
        {renderViewModalContent()}
        <div className="mt-6 flex justify-end">
          <Button variant="outlined" onClick={() => setViewingItem(null)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Admin;
