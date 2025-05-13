{ pkgs }: {
	deps = with pkgs; [
   pkgs.openssh
		nodejs-16_x
		nodePackages.typescript-language-server
	];
}
