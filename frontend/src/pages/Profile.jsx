import Layout from "../components/Layout";

function Profile() {
  return (
    <Layout>
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-3xl">

        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          User Profile
        </h1>

        <div className="space-y-4">

          <div>
            <label className="font-semibold">Full Name</label>
            <input
              type="text"
              value="Varshini"
              readOnly
              className="w-full border p-3 rounded-lg mt-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold">Email</label>
            <input
              type="email"
              value="varshini@example.com"
              readOnly
              className="w-full border p-3 rounded-lg mt-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold">Role</label>
            <input
              type="text"
              value="Wildlife Researcher"
              readOnly
              className="w-full border p-3 rounded-lg mt-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold">Organization</label>
            <input
              type="text"
              value="Infosys Springboard Internship"
              readOnly
              className="w-full border p-3 rounded-lg mt-1 bg-gray-100"
            />
          </div>

          <button className="bg-purple-700 text-white px-6 py-3 rounded-lg mt-4">
            Edit Profile
          </button>

        </div>

      </div>
    </Layout>
  );
}

export default Profile;