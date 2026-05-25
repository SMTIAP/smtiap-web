import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useState } from "react";
import { useTenant } from "../contexts/TenantContext";
import { toast } from "sonner";

export default function OrganizationRegistration() {
  const navigate = useNavigate();
  const { refreshTenants } = useTenant();
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    address: "",
    description: "",
    orgType: "",
    domain: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    if (!formData.name.trim()) newErrors.name = "Organization name is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.domain.trim()) newErrors.domain = "Domain is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.orgType) newErrors.orgType = "Select organization type";

    if (formData.domain.trim() && !domainRegex.test(formData.domain)) {
      newErrors.domain = "Please enter a valid domain (e.g. example.com)";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/organization-registration",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      await refreshTenants();
      toast.success("Organization Registered");
      navigate("/role-management");
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col items-center transition-colors duration-300">
      {/* Header */}
      <div className="w-full max-w-4xl px-6 py-8 flex items-center gap-4">
        <BackButton />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Organization Registration
        </h1>
      </div>

      {/* FORM WRAPPER */}
      <div className="w-full max-w-4xl px-6 pb-10">
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm p-10 flex flex-col gap-8 transition-colors duration-300">
          {/* Title */}
          <div className="border-b dark:border-slate-700 pb-3">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              Organization Details
            </h2>
          </div>

          {/* Organization Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Organization Name
            </label>
            <input
              onChange={handleChange}
              name="name"
              value={formData.name}
              type="text"
              placeholder="Enter organization name"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Country */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
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
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Address
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              type="text"
              placeholder="Enter address"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* Organization Domain */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Organization Domain
            </label>
            <input
              onChange={handleChange}
              name="domain"
              value={formData.domain}
              type="text"
              placeholder="Enter organization domain"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            {errors.domain && (
              <p className="text-red-500 text-sm mt-1">{errors.domain}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter description"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Type */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Organization Type
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orgType"
                  value="profit"
                  checked={formData.orgType === "profit"}
                  onChange={handleChange}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  For Profit
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orgType"
                  value="non-profit"
                  checked={formData.orgType === "non-profit"}
                  onChange={handleChange}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Non Profit
                </span>
              </label>
            </div>
            {errors.orgType && (
              <p className="text-red-500 text-sm mt-1">{errors.orgType}</p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-10 rounded-lg transition self-center"
          >
            Register Organization
          </button>
        </div>
      </div>
    </div>
  );
}
