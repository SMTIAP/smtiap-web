import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTenant } from "../contexts/TenantContext";
import { toast } from "sonner";
import { Building2, ArrowLeft, CheckSquare } from "lucide-react";

export default function OrganizationRegistration() {
  const navigate = useNavigate();
  const { refreshTenants } = useTenant();
  const [formData, setFormData] = useState({
    name: "", country: "", address: "", description: "", orgType: "", domain: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sonner-based confirmation dialog (returns a promise)
  const confirmAsync = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 w-80">
            <p className="text-base text-gray-800 dark:text-slate-200 mb-5 leading-relaxed">
              {message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  toast.dismiss(t);
                  resolve(false);
                }}
                className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t);
                  resolve(true);
                }}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        ),
        { duration: Infinity, position: "bottom-right" },
      );
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    if (!formData.name.trim()) newErrors.name = "Organization name is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.domain.trim()) newErrors.domain = "Domain is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.orgType) newErrors.orgType = "Select organization type";
    if (formData.domain.trim() && !domainRegex.test(formData.domain)) {
      newErrors.domain = "Please enter a valid domain (e.g. example.com)";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Confirmation AFTER validation
    const confirmed = await confirmAsync(
      `Create Organization "${formData.name}"?`
    );

  if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/organization-registration", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) { toast.error(data.message || "Something went wrong"); return; }
      await refreshTenants();
      toast.success("Organization Registered");
      navigate("/role-management");
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  const inputClass ="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder:text-slate-400";
  const labelClass ="text-sm font-medium text-slate-600 dark:text-slate-400";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col items-center transition-colors duration-300">
      {/* Header */}
      <div className="w-full max-w-4xl px-6 py-8 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
        
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-[#0D141C] dark:text-white">
            Organization Registration
          </h2>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
      </div>

      {/* Form Wrapper */}
      <div className="w-full max-w-4xl px-6 pb-10">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-10 flex flex-col gap-8 transition-colors duration-300">
          {/* Title */}
          <div className="border-b dark:border-slate-700 pb-3">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              Organization Details
            </h2>
          </div>

          {/* Organization Name */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              Organization Name
            </label>
            <input
              onChange={handleChange}
              name="name"
              value={formData.name}
              type="text"
              placeholder="Enter organization name"
              className={inputClass}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Country */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select country</option>
              <option value="Afghanistan">Afghanistan</option>
              <option value="Albania">Albania</option>
              <option value="Algeria">Algeria</option>
              <option value="Andorra">Andorra</option>
              <option value="Angola">Angola</option>
              <option value="Argentina">Argentina</option>
              <option value="Armenia">Armenia</option>
              <option value="Australia">Australia</option>
              <option value="Austria">Austria</option>
              <option value="Azerbaijan">Azerbaijan</option>
              <option value="Bahrain">Bahrain</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Belgium">Belgium</option>
              <option value="Bhutan">Bhutan</option>
              <option value="Bolivia">Bolivia</option>
              <option value="Brazil">Brazil</option>
              <option value="Brunei">Brunei</option>
              <option value="Bulgaria">Bulgaria</option>
              <option value="Cambodia">Cambodia</option>
              <option value="Canada">Canada</option>
              <option value="Chile">Chile</option>
              <option value="China">China</option>
              <option value="Colombia">Colombia</option>
              <option value="Croatia">Croatia</option>
              <option value="Cuba">Cuba</option>
              <option value="Cyprus">Cyprus</option>
              <option value="Czech Republic">Czech Republic</option>
              <option value="Denmark">Denmark</option>
              <option value="Egypt">Egypt</option>
              <option value="Estonia">Estonia</option>
              <option value="Finland">Finland</option>
              <option value="France">France</option>
              <option value="Germany">Germany</option>
              <option value="Ghana">Ghana</option>
              <option value="Greece">Greece</option>
              <option value="Hong Kong">Hong Kong</option>
              <option value="Hungary">Hungary</option>
              <option value="Iceland">Iceland</option>
              <option value="India">India</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Iran">Iran</option>
              <option value="Iraq">Iraq</option>
              <option value="Ireland">Ireland</option>
              <option value="Israel">Israel</option>
              <option value="Italy">Italy</option>
              <option value="Japan">Japan</option>
              <option value="Jordan">Jordan</option>
              <option value="Kazakhstan">Kazakhstan</option>
              <option value="Kenya">Kenya</option>
              <option value="Kuwait">Kuwait</option>
              <option value="Laos">Laos</option>
              <option value="Lebanon">Lebanon</option>
              <option value="Libya">Libya</option>
              <option value="Luxembourg">Luxembourg</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Maldives">Maldives</option>
              <option value="Mexico">Mexico</option>
              <option value="Mongolia">Mongolia</option>
              <option value="Morocco">Morocco</option>
              <option value="Myanmar">Myanmar</option>
              <option value="Nepal">Nepal</option>
              <option value="Netherlands">Netherlands</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Nigeria">Nigeria</option>
              <option value="North Korea">North Korea</option>
              <option value="Norway">Norway</option>
              <option value="Oman">Oman</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Palestine">Palestine</option>
              <option value="Peru">Peru</option>
              <option value="Philippines">Philippines</option>
              <option value="Poland">Poland</option>
              <option value="Portugal">Portugal</option>
              <option value="Qatar">Qatar</option>
              <option value="Romania">Romania</option>
              <option value="Russia">Russia</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="Singapore">Singapore</option>
              <option value="South Africa">South Africa</option>
              <option value="South Korea">South Korea</option>
              <option value="Spain">Spain</option>
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="Sweden">Sweden</option>
              <option value="Switzerland">Switzerland</option>
              <option value="Syria">Syria</option>
              <option value="Taiwan">Taiwan</option>
              <option value="Thailand">Thailand</option>
              <option value="Turkey">Turkey</option>
              <option value="Ukraine">Ukraine</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Uzbekistan">Uzbekistan</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Vietnam">Vietnam</option>
              <option value="Yemen">Yemen</option>
              <option value="Zimbabwe">Zimbabwe</option>
            </select>
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              Address
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              type="text"
              placeholder="Enter address"
              className={inputClass}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* Domain */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              Organization Domain
            </label>
            <input
              onChange={handleChange}
              name="domain"
              value={formData.domain}
              type="text"
              placeholder="Enter organization domain"
              className={inputClass}
            />
            {errors.domain && (
              <p className="text-red-500 text-sm mt-1">{errors.domain}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter description"
              className={`${inputClass} resize-none`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Org Type */}
          <div className="flex flex-col gap-3">
            <label className={labelClass}>
              Organization Type
            </label>
            <div className="flex gap-4">
                <label
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm cursor-pointer transition-all hover:border-indigo-400 ${
                    formData.orgType === "profit"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                <input
                  type="radio"
                  name="orgType"
                  value="profit"
                  checked={formData.orgType === "profit"}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-400"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  For Profit
                </span>
              </label>
              <label
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm cursor-pointer transition-all hover:border-indigo-400 ${
                  formData.orgType === "non-profit"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="orgType"
                  value="non-profit"
                  checked={formData.orgType === "non-profit"}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-400"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">

                  Non Profit
                </span>
              </label>
            </div>
            {errors.orgType && <p className="text-red-500 text-sm mt-1">{errors.orgType}</p>}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit}
            className="mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:scale-[1.02] text-white font-semibold text-[15px] py-3 px-10 rounded-lg transition-all duration-200 self-center shrink-0 flex items-center gap-2">
             <CheckSquare size={18} />Register Organization
          </button>
        </div>
      </div>
    </div>
  );
}