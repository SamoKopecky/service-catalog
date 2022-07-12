NODEJS_BASE_IMAGE=$(cat .aicoe-ci.yaml | grep -oP '(?<=base-image: ).*')


# Checks whether the important programs are installed
if ! command -v podman &> /dev/null; then
  echo "This script requires podman to be installed."
  exit 1
fi
if ! command -v s2i &> /dev/null; then
  echo "This script requires s2i to be installed."
  exit 1
fi
# Creates temporary folder for the build
tmp_dir=$(mktemp -d -t service-catalog-XXXXXXXXXX)


echo "---> Run s2i build"
s2i build -c . ${NODEJS_BASE_IMAGE} --as-dockerfile ${tmp_dir}/Containerfile
cd $tmp_dir

# Try only install python-pip
REPLACE_STRING='USER root\nRUN dnf install -y python python-pip java \&\& \\\npip install mkdocs graphviz mkdocs-techdocs-core==1.0.2\n'

# REPLACE_STRING="${REPLACE_STRING}RUN curl -o plantuml.jar -L http:\/\/sourceforge.net\/projects\/plantuml\/files\/plantuml.1.2022.4.jar\/download \&\& echo \"246d1ed561ebbcac14b2798b45712a9d018024c0  plantuml.jar\" \| sha1sum -c - \&\& mv plantuml.jar \/opt\/plantuml.jar"
# REPLACE_STRING='USER root\nRUN yum install -y yum-utils \&\& \\\nyum-config-manager --add-repo https:\/\/download.docker.com\/linux\/centos\/docker-ce.repo \&\& \\\nyum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin \&\& \\\nsystemctl enable docker.service \&\& \\\nsystemctl enable containerd.service \&\& \\\nusermod -a -G docker default'

echo "---> Create image"
sed "s/USER root/${REPLACE_STRING}/" -i ${tmp_dir}/Containerfile
# sed "s/USER 1001/RUN cat \/tmp\/src\/plantuml \>\> \/usr\/local\/bin\/plantuml\nRUN chmod 755 \/usr\/local\/bin\/plantuml\nUSER 1001/" -i ${tmp_dir}/Containerfile
cat ${tmp_dir}/Containerfile
podman build -t service-catalog .

echo "---> Clean up"
rm -rf $tmp_dir
